export type SfxName = "collect" | "hit" | "win" | "shield" | "boost"

const MUTE_STORAGE_KEY = "noe_v2_muted"

const SFX: Record<
  SfxName,
  { frequency: number; duration: number; type: OscillatorType; volume: number }
> = {
  collect: { frequency: 660, duration: 0.1, type: "sine", volume: 0.12 },
  hit: { frequency: 110, duration: 0.2, type: "sawtooth", volume: 0.16 },
  win: { frequency: 880, duration: 0.45, type: "triangle", volume: 0.14 },
  shield: { frequency: 440, duration: 0.25, type: "square", volume: 0.1 },
  boost: { frequency: 720, duration: 0.28, type: "triangle", volume: 0.12 },
}

let audioContext: AudioContext | null = null
let muted: boolean | null = null

function readMuted() {
  if (muted !== null) return muted

  try {
    muted =
      typeof window !== "undefined" &&
      window.localStorage.getItem(MUTE_STORAGE_KEY) === "true"
  } catch {
    muted = false
  }

  return muted
}

export function isMuted() {
  return readMuted()
}

export function setMuted(value: boolean) {
  muted = value

  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MUTE_STORAGE_KEY, String(value))
    }
  } catch {
    // Audio still works when storage is unavailable.
  }
}

export async function unlock() {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
    return
  }

  audioContext ??= new window.AudioContext()

  if (audioContext.state === "suspended") {
    await audioContext.resume()
  }
}

export function playSfx(name: SfxName) {
  if (readMuted() || !audioContext || audioContext.state !== "running") return

  const { frequency, duration, type, volume } = SFX[name]
  const now = audioContext.currentTime
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + duration)
}
