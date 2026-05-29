// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – onnxruntime-web types.d.ts doesn't match package.json exports in this version
import * as ort from 'onnxruntime-web'

// WASM files are copied to public/ort/ at build time
ort.env.wasm.wasmPaths = '/ort/'

// ── constants ────────────────────────────────────────────────────────────────
const REPO = 'nsarang/F5-TTS-ONNX'
const HF_BASE = `https://huggingface.co/${REPO}/resolve/main`
const CACHE_NAME = 'f5tts-v1'
const SAMPLE_RATE = 24000
const HOP_LENGTH = 256
const TARGET_RMS = 0.1
const NFE_STEPS = 32

// ── state ────────────────────────────────────────────────────────────────────
let sessions: {
  encoder: ort.InferenceSession
  transformer: ort.InferenceSession
  decoder: ort.InferenceSession
} | null = null

let vocab: Map<string, number> | null = null
let refState: { audio: Float32Array; text: string } | null = null

// ── HuggingFace fetch with Cache Storage ─────────────────────────────────────
async function fetchHF(
  path: string,
  onProgress: (file: string, pct: number) => void,
): Promise<ArrayBuffer> {
  const url = `${HF_BASE}/${path}`
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(url)
  if (cached) return cached.arrayBuffer()

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)

  const total = Number(res.headers.get('content-length') ?? 0)
  const reader = res.body!.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    if (total) onProgress(path, (loaded / total) * 100)
  }

  const buf = new Uint8Array(loaded)
  let off = 0
  for (const chunk of chunks) { buf.set(chunk, off); off += chunk.length }

  await cache.put(url, new Response(buf.buffer, { headers: { 'content-type': 'application/octet-stream' } }))
  return buf.buffer
}

// ── vocab / tokeniser ────────────────────────────────────────────────────────
function buildVocab(text: string): Map<string, number> {
  const map = new Map<string, number>()
  text.split('\n').forEach((line, i) => {
    const t = line.trim()
    if (t) map.set(t, i)
  })
  return map
}

function tokenise(text: string): number[] {
  if (!vocab) throw new Error('Vocab not loaded')
  return text.split('').map(c => vocab!.get(c) ?? 0)
}

// ── audio prep ───────────────────────────────────────────────────────────────
function calcRMS(audio: Float32Array): number {
  let sum = 0
  for (let i = 0; i < audio.length; i++) sum += audio[i] * audio[i]
  return Math.sqrt(sum / audio.length)
}

function normaliseToInt16(audio: Float32Array): Int16Array {
  const rms = calcRMS(audio)
  let src = audio

  // Boost quiet audio towards targetRMS
  if (rms > 0 && rms < TARGET_RMS) {
    const factor = TARGET_RMS / rms
    src = new Float32Array(audio.length)
    for (let i = 0; i < audio.length; i++) src[i] = audio[i] * factor
  }

  // Quantile (99.9 %) normalise → int16
  const abs = new Float32Array(src.length)
  for (let i = 0; i < src.length; i++) abs[i] = Math.abs(src[i])
  const sorted = abs.slice().sort()
  const q999 = sorted[Math.floor(sorted.length * 0.999)] ?? sorted[sorted.length - 1]
  const scale = q999 > 0 ? 32767 / q999 : 1

  const out = new Int16Array(src.length)
  for (let i = 0; i < src.length; i++) {
    out[i] = Math.round(Math.max(-32768, Math.min(32767, src[i] * scale)))
  }
  return out
}

// ── WAV encoder ──────────────────────────────────────────────────────────────
function encodeWav(samples: Float32Array): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2)
  const dv = new DataView(buf)
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i)) }
  str(0, 'RIFF'); dv.setUint32(4, 36 + samples.length * 2, true)
  str(8, 'WAVE'); str(12, 'fmt ')
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true)
  dv.setUint16(22, 1, true); dv.setUint32(24, SAMPLE_RATE, true)
  dv.setUint32(28, SAMPLE_RATE * 2, true); dv.setUint16(32, 2, true)
  dv.setUint16(34, 16, true); str(36, 'data')
  dv.setUint32(40, samples.length * 2, true)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    dv.setInt16(44 + i * 2, s < 0 ? s * 32768 : s * 32767, true)
  }
  return new Blob([buf], { type: 'audio/wav' })
}

// ── device detection ─────────────────────────────────────────────────────────
async function pickProvider(): Promise<string> {
  if ('gpu' in navigator) {
    try {
      const adapter = await navigator.gpu.requestAdapter()
      if (adapter) return 'webgpu'
    } catch { /* fall through */ }
  }
  return 'wasm'
}

// ── model loading ─────────────────────────────────────────────────────────────
async function loadModels() {
  const provider = await pickProvider()
  postMessage({ type: 'device', device: provider })

  const progress = (file: string, pct: number) =>
    postMessage({ type: 'progress', file, progress: pct } satisfies WorkerOut)

  // vocab
  const vocabBuf = await fetchHF('vocab.txt', progress)
  vocab = buildVocab(new TextDecoder().decode(vocabBuf))
  postMessage({ type: 'progress', file: 'vocab.txt', progress: 100 })

  // three ONNX models
  const [encBuf, trfBuf, decBuf] = await Promise.all([
    fetchHF('onnx/encoder_fp32.onnx', progress),
    fetchHF('onnx/transformer_fp32.onnx', progress),
    fetchHF('onnx/decoder_fp32.onnx', progress),
  ])

  const sessionOpts: ort.InferenceSession.SessionOptions = {
    executionProviders: [provider, 'wasm'],
    graphOptimizationLevel: 'all',
    logSeverityLevel: 3,
  }

  sessions = {
    encoder:     await ort.InferenceSession.create(encBuf, sessionOpts),
    transformer: await ort.InferenceSession.create(trfBuf, sessionOpts),
    decoder:     await ort.InferenceSession.create(decBuf, sessionOpts),
  }

  postMessage({ type: 'ready' })
}

// ── inference ─────────────────────────────────────────────────────────────────
async function synthesise(genText: string, speed: number) {
  if (!sessions) throw new Error('Models not loaded')
  if (!refState) throw new Error('Reference audio not set')

  const { encoder, transformer, decoder } = sessions
  const { audio: refAudio, text: refText } = refState

  // Prepare reference audio tensor [1, 1, N] int16
  const int16 = normaliseToInt16(refAudio)
  const audioTensor = new ort.Tensor('int16', int16, [1, 1, int16.length])

  // Tokenise combined text
  const combinedText = refText + ' ' + genText
  const tokens = tokenise(combinedText)
  const textTensor = new ort.Tensor('int32', new Int32Array(tokens), [1, tokens.length])

  // Duration
  const refLen = Math.trunc(refAudio.length / HOP_LENGTH)
  const dur = refLen + Math.trunc((refLen / (refText.length + 1)) * genText.length / speed)
  const durTensor = new ort.Tensor('int64', new BigInt64Array([BigInt(dur)]), [1])

  // Stage A — encoder
  const encIn: Record<string, ort.Tensor> = {}
  encIn[encoder.inputNames[0]] = audioTensor
  encIn[encoder.inputNames[1]] = textTensor
  encIn[encoder.inputNames[2]] = durTensor

  const encOut = await encoder.run(encIn)
  let noise       = encOut[encoder.outputNames[0]]
  const ropeCosQ  = encOut[encoder.outputNames[1]]
  const ropeSinQ  = encOut[encoder.outputNames[2]]
  const ropeCosK  = encOut[encoder.outputNames[3]]
  const ropeSinK  = encOut[encoder.outputNames[4]]
  const catMelTxt = encOut[encoder.outputNames[5]]
  const catMelDrp = encOut[encoder.outputNames[6]]
  const refSigLen = encOut[encoder.outputNames[7]]

  // Stage B — NFE transformer loop
  let timeStep = new ort.Tensor('int32', new Int32Array([0]), [1])

  for (let step = 0; step < NFE_STEPS - 1; step++) {
    const trfIn: Record<string, ort.Tensor> = {}
    trfIn[transformer.inputNames[0]] = noise
    trfIn[transformer.inputNames[1]] = ropeCosQ
    trfIn[transformer.inputNames[2]] = ropeSinQ
    trfIn[transformer.inputNames[3]] = ropeCosK
    trfIn[transformer.inputNames[4]] = ropeSinK
    trfIn[transformer.inputNames[5]] = catMelTxt
    trfIn[transformer.inputNames[6]] = catMelDrp
    trfIn[transformer.inputNames[7]] = timeStep

    const trfOut = await transformer.run(trfIn)
    noise    = trfOut[transformer.outputNames[0]]
    timeStep = trfOut[transformer.outputNames[1]]

    postMessage({ type: 'nfe', step: step + 1, total: NFE_STEPS })
  }

  // Stage C — decoder
  const decIn: Record<string, ort.Tensor> = {}
  decIn[decoder.inputNames[0]] = noise
  decIn[decoder.inputNames[1]] = refSigLen

  const decOut = await decoder.run(decIn)
  const raw = decOut[decoder.outputNames[0]].data as Int16Array | Float32Array

  // Convert output (may be int16 or float32 depending on model) to float32 [-1, 1]
  let samples: Float32Array
  if (raw instanceof Int16Array) {
    samples = new Float32Array(raw.length)
    for (let i = 0; i < raw.length; i++) samples[i] = raw[i] / 32767
  } else {
    samples = raw as Float32Array
    // Revert int16 scale if values exceed 1
    const maxAbs = samples.reduce((m, x) => Math.max(m, Math.abs(x)), 0)
    if (maxAbs > 1) {
      samples = samples.map(x => x / 32767)
    }
  }

  // Rebalance RMS to match reference
  const refRMS = calcRMS(refAudio)
  const genRMS = calcRMS(samples)
  if (genRMS > 0 && refRMS > 0) {
    const factor = refRMS / genRMS
    samples = samples.map(x => x * factor)
  }

  postMessage({ type: 'audio', blob: encodeWav(samples) })
}

// ── message handler ──────────────────────────────────────────────────────────
self.addEventListener('message', async (e: MessageEvent<WorkerIn>) => {
  const msg = e.data
  try {
    if (msg.type === 'load') {
      await loadModels()
    } else if (msg.type === 'setRef') {
      refState = { audio: msg.audio, text: msg.text }
      postMessage({ type: 'refReady' } satisfies WorkerOut)
    } else if (msg.type === 'generate') {
      await synthesise(msg.text, msg.speed)
    }
  } catch (err) {
    postMessage({ type: 'error', message: String(err) } satisfies WorkerOut)
  }
})

// ── types ────────────────────────────────────────────────────────────────────
type WorkerIn =
  | { type: 'load' }
  | { type: 'setRef'; audio: Float32Array; text: string }
  | { type: 'generate'; text: string; speed: number }

type WorkerOut =
  | { type: 'device'; device: string }
  | { type: 'progress'; file: string; progress: number }
  | { type: 'ready' }
  | { type: 'refReady' }
  | { type: 'nfe'; step: number; total: number }
  | { type: 'audio'; blob: Blob }
  | { type: 'error'; message: string }
