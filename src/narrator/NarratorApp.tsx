import { useEffect, useRef, useState } from 'react'
import { DEFAULT_TRANSCRIPT, stripDirection } from './transcript.ts'
import styles from './NarratorApp.module.css'

interface VoiceEntry {
  id: string
  name?: string
  language?: string
  gender?: string
  quality?: string
  overallGrade?: string
  targetQuality?: string
}

interface ProgressState {
  file?: string
  progress?: number
}

type LoadPhase = 'idle' | 'loading' | 'ready' | 'generating' | 'error'

const BM_VOICE_PREFERENCE = ['bm_george', 'bm_fable', 'bm_lewis', 'bm_daniel']

function sortVoices(voices: VoiceEntry[]): VoiceEntry[] {
  const bm = voices.filter(v => v.id.startsWith('bm_'))
  const am = voices.filter(v => v.id.startsWith('am_'))
  const rest = voices.filter(v => !v.id.startsWith('bm_') && !v.id.startsWith('am_'))
  const sortBm = [...bm].sort((a, b) => {
    const ai = BM_VOICE_PREFERENCE.indexOf(a.id)
    const bi = BM_VOICE_PREFERENCE.indexOf(b.id)
    if (ai >= 0 && bi >= 0) return ai - bi
    if (ai >= 0) return -1
    if (bi >= 0) return 1
    return 0
  })
  return [...sortBm, ...am, ...rest]
}

export default function NarratorApp() {
  const [phase, setPhase] = useState<LoadPhase>('idle')
  const [device, setDevice] = useState<string>('')
  const [dtype, setDtype] = useState<string>('')
  const [progress, setProgress] = useState<ProgressState>({})
  const [voices, setVoices] = useState<VoiceEntry[]>([])
  const [selectedVoice, setSelectedVoice] = useState('bm_george')
  const [speed, setSpeed] = useState(0.8)
  const [transcript, setTranscript] = useState(DEFAULT_TRANSCRIPT)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [status, setStatus] = useState('Initializing...')

  const workerRef = useRef<Worker | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const worker = new Worker(new URL('./tts.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data
      switch (msg.type) {
        case 'device':
          setDevice(msg.device)
          setDtype(msg.dtype)
          setStatus(`Loading model (${msg.device === 'webgpu' ? '~326 MB fp32' : '~92 MB q8'}, cached after first download)…`)
          break
        case 'progress':
          if (msg.status === 'initiate') {
            setStatus(`Downloading ${msg.file ?? 'model'}…`)
          }
          if (typeof msg.progress === 'number') {
            setProgress({ file: msg.file, progress: msg.progress })
          }
          break
        case 'ready': {
          const sorted = sortVoices(msg.voices as VoiceEntry[])
          setVoices(sorted)
          const defaultVoice = sorted.find(v => v.id === 'bm_george') ? 'bm_george' : sorted[0]?.id ?? 'bm_george'
          setSelectedVoice(defaultVoice)
          setPhase('ready')
          setStatus('Model ready.')
          break
        }
        case 'audio': {
          if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
          const url = URL.createObjectURL(msg.blob as Blob)
          prevUrlRef.current = url
          setAudioUrl(url)
          setPhase('ready')
          setStatus('Done.')
          setTimeout(() => audioRef.current?.play(), 100)
          break
        }
        case 'error':
          setPhase('error')
          setErrorMsg(msg.message)
          setStatus('')
          break
      }
    }

    setPhase('loading')
    worker.postMessage({ type: 'load' })

    return () => {
      worker.terminate()
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
    }
  }, [])

  function handleSynthesize() {
    if (!workerRef.current || phase !== 'ready') return
    const text = stripDirection(transcript)
    if (!text.trim()) return
    setPhase('generating')
    setStatus('Synthesizing…')
    setAudioUrl(null)
    workerRef.current.postMessage({ type: 'generate', text, voice: selectedVoice, speed })
  }

  function handleDownload() {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = 'narration.wav'
    a.click()
  }

  const isWebGPU = device === 'webgpu'
  const progressPct = progress.progress ?? 0

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Gothic Narrator</h1>
      <p className={styles.subheading}>
        In-browser neural TTS — no server, no API key
      </p>

      <div className={styles.card}>
        {device && (
          <div className={`${styles.deviceBadge} ${isWebGPU ? styles.webgpu : styles.wasm}`}>
            <span className={styles.dot} />
            {isWebGPU ? `WebGPU (${dtype})` : `WASM (${dtype}) — slower`}
          </div>
        )}

        {phase === 'loading' && (
          <div className={styles.progressWrap}>
            <div className={styles.progressLabel}>
              <span>{progress.file ? progress.file.split('/').pop() : 'Waiting…'}</span>
              <span>{progressPct > 0 ? `${Math.round(progressPct)}%` : ''}</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
            <p className={styles.statusMsg}>{status}</p>
          </div>
        )}

        {phase === 'error' && (
          <div className={styles.error}>{errorMsg}</div>
        )}

        <div>
          <label className={styles.label} htmlFor="transcript">Transcript</label>
          <textarea
            id="transcript"
            className={styles.textarea}
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="voice">Voice</label>
            <select
              id="voice"
              className={styles.select}
              value={selectedVoice}
              onChange={e => setSelectedVoice(e.target.value)}
              disabled={voices.length === 0}
            >
              {voices.length === 0 && <option value="bm_george">bm_george (loading…)</option>}
              {voices.map(v => (
                <option key={v.id} value={v.id}>
                  {v.id}{v.language ? ` — ${v.language}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="speed">Speed</label>
            <input
              id="speed"
              type="range"
              className={styles.slider}
              min={0.5}
              max={1.5}
              step={0.05}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
            />
            <div className={styles.sliderValue}>{speed.toFixed(2)}×</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={handleSynthesize}
            disabled={phase !== 'ready'}
          >
            {phase === 'generating' ? 'Synthesizing…' : 'Synthesize'}
          </button>
          <button
            className={styles.btnSecondary}
            onClick={handleDownload}
            disabled={!audioUrl}
          >
            Download WAV
          </button>
        </div>

        {(phase === 'generating' || (phase === 'ready' && status && status !== 'Model ready.')) && (
          <p className={styles.statusMsg}>{status}</p>
        )}

        {audioUrl && (
          <audio
            ref={audioRef}
            className={styles.audioPlayer}
            src={audioUrl}
            controls
          />
        )}
      </div>
    </div>
  )
}
