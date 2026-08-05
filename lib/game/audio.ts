export type SfxName = "collect" | "hit" | "win" | "shield" | "boost"

const MUTE_STORAGE_KEY = "noe_v2_muted"
export const SOUNDTRACK_SRC = "/audio/beyond-the-blue-dust.mp3"
const SOUNDTRACK_VOLUME = 0.35

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
let soundtrack: HTMLAudioElement | null = null

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

export function initSoundtrack() {
  if (typeof window === "undefined" || typeof window.Audio === "undefined") {
    return null
  }
  if (soundtrack) return soundtrack

  soundtrack = new window.Audio(SOUNDTRACK_SRC)
  soundtrack.loop = true
  soundtrack.preload = "auto"
  soundtrack.volume = SOUNDTRACK_VOLUME
  soundtrack.setAttribute("playsinline", "true")
  soundtrack.setAttribute("webkit-playsinline", "true")
  return soundtrack
}

export function pauseSoundtrack() {
  soundtrack?.pause()
}

export function isSoundtrackPlaying() {
  return Boolean(soundtrack && !soundtrack.paused && !soundtrack.ended)
}

/** @returns true if playback actually started */
export async function playSoundtrack(): Promise<boolean> {
  const track = initSoundtrack()
  if (!track) return false
  if (readMuted()) return false

  await unlock()
  try {
    await track.play()
    return !track.paused
  } catch {
    // Chromium/Safari block unmuted autoplay without a prior user gesture.
    return false
  }
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

  if (value) {
    pauseSoundtrack()
  } else {
    void playSoundtrack()
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
