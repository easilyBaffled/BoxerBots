import { KokoroTTS, type GenerateOptions } from 'kokoro-js'

type DeviceType = 'webgpu' | 'wasm'

async function pickDevice(): Promise<DeviceType> {
  if (!('gpu' in navigator)) return 'wasm'
  try {
    const adapter = await navigator.gpu.requestAdapter()
    return adapter ? 'webgpu' : 'wasm'
  } catch {
    return 'wasm'
  }
}

let tts: KokoroTTS | null = null

self.addEventListener('message', async (e: MessageEvent) => {
  const msg = e.data as WorkerInMessage

  if (msg.type === 'load') {
    try {
      const device = await pickDevice()
      const dtype = device === 'webgpu' ? 'fp32' : 'q8'
      postMessage({ type: 'device', device, dtype } satisfies WorkerOutMessage)

      tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
        dtype,
        device,
        progress_callback: (p: ProgressEvent) =>
          postMessage({ type: 'progress', ...p } satisfies WorkerOutMessage),
      })

      const voiceMap = tts.voices
      const voices = Object.entries(voiceMap).map(([id, meta]) => ({ id, ...meta }))
      postMessage({ type: 'ready', voices } satisfies WorkerOutMessage)
    } catch (err) {
      postMessage({ type: 'error', message: String(err) } satisfies WorkerOutMessage)
    }
    return
  }

  if (msg.type === 'generate') {
    if (!tts) {
      postMessage({ type: 'error', message: 'Model not loaded yet.' } satisfies WorkerOutMessage)
      return
    }
    try {
      const opts: GenerateOptions = { voice: msg.voice as GenerateOptions['voice'], speed: msg.speed }
      const audio = await tts.generate(msg.text, opts)
      const blob = audio.toBlob()
      postMessage({ type: 'audio', blob } satisfies WorkerOutMessage)
    } catch (err) {
      postMessage({ type: 'error', message: String(err) } satisfies WorkerOutMessage)
    }
  }
})

// ---- message types ----

type WorkerInMessage =
  | { type: 'load' }
  | { type: 'generate'; text: string; voice: string; speed: number }

interface ProgressEvent {
  status: string
  file?: string
  progress?: number
  loaded?: number
  total?: number
}

type WorkerOutMessage =
  | { type: 'device'; device: string; dtype: string }
  | ({ type: 'progress' } & ProgressEvent)
  | { type: 'ready'; voices: VoiceEntry[] }
  | { type: 'audio'; blob: Blob }
  | { type: 'error'; message: string }

interface VoiceEntry {
  id: string
  name?: string
  language?: string
  gender?: string
  quality?: string
}
