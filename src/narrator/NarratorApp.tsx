import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_TRANSCRIPT, stripDirection } from './transcript.ts'
import styles from './NarratorApp.module.css'

type LoadPhase = 'idle' | 'loading' | 'ready' | 'generating' | 'error'

export default function NarratorApp() {
  // model state
  const [phase, setPhase] = useState<LoadPhase>('idle')
  const [device, setDevice] = useState('')
  const [modelProgress, setModelProgress] = useState(0)
  const [modelFile, setModelFile] = useState('')
  const [nfeStep, setNfeStep] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  // reference clip state
  const [refReady, setRefReady] = useState(false)
  const [refName, setRefName] = useState('')
  const [refText, setRefText] = useState('')

  // synthesis state
  const [transcript, setTranscript] = useState(DEFAULT_TRANSCRIPT)
  const [speed, setSpeed] = useState(0.85)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const workerRef = useRef<Worker | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  // Spawn worker and start model download on mount
  useEffect(() => {
    const worker = new Worker(new URL('./tts.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data
      switch (msg.type) {
        case 'device':
          setDevice(msg.device)
          break
        case 'progress':
          setModelFile(msg.file?.split('/').pop() ?? '')
          setModelProgress(msg.progress ?? 0)
          break
        case 'ready':
          setPhase('ready')
          break
        case 'refReady':
          setRefReady(true)
          break
        case 'nfe':
          setNfeStep(msg.step)
          break
        case 'audio': {
          if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
          const url = URL.createObjectURL(msg.blob)
          prevUrlRef.current = url
          setAudioUrl(url)
          setPhase('ready')
          setNfeStep(0)
          setTimeout(() => audioRef.current?.play(), 80)
          break
        }
        case 'error':
          setPhase('error')
          setErrorMsg(msg.message)
          setNfeStep(0)
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

  // Decode the uploaded reference clip to Float32 @ 24 kHz on the main thread
  const handleRefFile = useCallback(async (file: File) => {
    try {
      const ctx = new AudioContext({ sampleRate: 24000 })
      const buf = await ctx.decodeAudioData(await file.arrayBuffer())
      ctx.close()

      // Mix to mono and trim to 30 seconds max
      const maxSamples = 24000 * 30
      const length = Math.min(buf.length, maxSamples)
      const mono = new Float32Array(length)
      for (let ch = 0; ch < buf.numberOfChannels; ch++) {
        const ch_data = buf.getChannelData(ch)
        for (let i = 0; i < length; i++) mono[i] += ch_data[i]
      }
      for (let i = 0; i < length; i++) mono[i] /= buf.numberOfChannels

      workerRef.current?.postMessage(
        { type: 'setRef', audio: mono, text: refText },
        [mono.buffer],
      )
      setRefName(file.name)
    } catch (err) {
      setErrorMsg(`Could not decode reference audio: ${err}`)
    }
  }, [refText])

  // Re-send reference whenever the transcript text changes
  const handleRefText = useCallback((t: string) => {
    setRefText(t)
    setRefReady(false) // stale until next file is re-set, or user re-uploads
  }, [])

  function handleSynthesize() {
    if (!workerRef.current || phase !== 'ready' || !refReady) return
    const text = stripDirection(transcript)
    if (!text.trim()) return
    setPhase('generating')
    setNfeStep(0)
    setAudioUrl(null)
    workerRef.current.postMessage({ type: 'generate', text, speed })
  }

  function handleDownload() {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = 'narration.wav'
    a.click()
  }

  const canSynth = phase === 'ready' && refReady
  const isWebGPU = device === 'webgpu'

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Gothic Narrator</h1>
      <p className={styles.subheading}>F5-TTS · in-browser neural voice cloning · no server</p>

      <div className={styles.card}>

        {/* device badge */}
        {device && (
          <div className={`${styles.deviceBadge} ${isWebGPU ? styles.webgpu : styles.wasm}`}>
            <span className={styles.dot} />
            {isWebGPU ? 'WebGPU' : 'WASM (slower)'}
          </div>
        )}

        {/* model download progress */}
        {phase === 'loading' && (
          <div className={styles.progressWrap}>
            <div className={styles.progressLabel}>
              <span>{modelFile || 'Downloading models…'}</span>
              <span>{modelProgress > 0 ? `${Math.round(modelProgress)}%` : ''}</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${modelProgress}%` }} />
            </div>
            <p className={styles.statusMsg}>
              Models download once (~200 MB) then cache in-browser.
            </p>
          </div>
        )}

        {/* NFE progress */}
        {phase === 'generating' && (
          <div className={styles.progressWrap}>
            <div className={styles.progressLabel}>
              <span>Flow matching…</span>
              <span>{nfeStep}/{32}</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${(nfeStep / 32) * 100}%` }} />
            </div>
          </div>
        )}

        {phase === 'error' && <div className={styles.error}>{errorMsg}</div>}

        {/* ── reference clip ── */}
        <section>
          <span className={styles.sectionTitle}>1 · Reference voice clip</span>
          <p className={styles.hint}>
            Upload 5–30 seconds of the narrator voice you want. F5-TTS clones it.
          </p>
          <label className={styles.fileLabel}>
            <input
              type="file"
              accept="audio/*"
              className={styles.fileInput}
              onChange={e => { if (e.target.files?.[0]) handleRefFile(e.target.files[0]) }}
            />
            <span className={styles.fileBtn}>Choose audio file</span>
            <span className={styles.fileName}>{refName || 'No file chosen'}</span>
          </label>
          {refReady && <p className={styles.ok}>✓ Reference voice loaded</p>}

          <label className={styles.label} htmlFor="reftext" style={{ marginTop: '0.75rem' }}>
            What does the clip say? (reference transcript)
          </label>
          <textarea
            id="reftext"
            className={`${styles.textarea} ${styles.textareaSmall}`}
            value={refText}
            placeholder="Type the words spoken in your reference clip…"
            onChange={e => handleRefText(e.target.value)}
            spellCheck={false}
          />
          {refName && !refReady && (
            <p className={styles.hint} style={{ marginTop: '0.25rem' }}>
              Re-upload the clip after changing the transcript.
            </p>
          )}
        </section>

        {/* ── generation text ── */}
        <section>
          <span className={styles.sectionTitle}>2 · Text to narrate</span>
          <textarea
            className={styles.textarea}
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            spellCheck={false}
          />
        </section>

        {/* ── speed ── */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="speed">Speed</label>
          <input
            id="speed"
            type="range"
            className={styles.slider}
            min={0.5} max={1.5} step={0.05}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <div className={styles.sliderValue}>{speed.toFixed(2)}×</div>
        </div>

        {/* ── actions ── */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleSynthesize} disabled={!canSynth}>
            {phase === 'generating' ? 'Synthesizing…' : 'Synthesize'}
          </button>
          <button className={styles.btnSecondary} onClick={handleDownload} disabled={!audioUrl}>
            Download WAV
          </button>
        </div>

        {audioUrl && (
          <audio ref={audioRef} className={styles.audioPlayer} src={audioUrl} controls />
        )}
      </div>
    </div>
  )
}
