export const RAW_TRANSCRIPT = `Read the following transcript based on the audio profile and director's note.

# Audio Profile
A deep, resonant narrator of mysteries.

# Director's note
Style: Whisper. Pace: The Drift. Accent: British (GB).

## Scene:
A quiet, old library on a rainy night. Lightning occasionally flashes through the tall, arched windows.

## Sample Context:
Gothic fiction. Slow, deliberate pace with atmospheric pauses. Tone is suspenseful and deeply resonant.

## Transcript:
[description] The old house stood at the edge of the moor, its windows dark save for a single candle flickering on the third floor. [mystery] No one had lived there for years—or so the village believed. [tension] But as Elias crept closer, the heavy wooden door creaked open, groaning against its rusted hinges. [sensory] A cold draft swept past him, carrying the faint scent of old parchment.`

export const DEFAULT_TRANSCRIPT = stripDirection(RAW_TRANSCRIPT)

export function stripDirection(raw: string): string {
  const lines = raw.split('\n')
  const transcriptIdx = lines.findIndex(l => l.trim().startsWith('## Transcript:'))
  const prose = transcriptIdx >= 0 ? lines.slice(transcriptIdx + 1).join('\n') : raw
  // Remove [tag] markers and trim
  return prose.replace(/\[[^\]]+\]\s*/g, '').trim()
}
