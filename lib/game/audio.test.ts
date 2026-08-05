import { beforeEach, describe, expect, it, vi } from "vitest"

class FakeAudioParam {
  value = 0

  setValueAtTime(value: number) {
    this.value = value
  }

  exponentialRampToValueAtTime(value: number) {
    this.value = value
  }
}

class FakeOscillator {
  type = "sine"
  frequency = new FakeAudioParam()
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class FakeGain {
  gain = new FakeAudioParam()
  connect = vi.fn()
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = []

  currentTime = 10
  destination = {}
  state: AudioContextState = "suspended"
  resume = vi.fn(async () => {
    this.state = "running"
  })
  createOscillator = vi.fn(() => new FakeOscillator())
  createGain = vi.fn(() => new FakeGain())

  constructor() {
    FakeAudioContext.instances.push(this)
  }
}

class FakeHtmlAudio {
  loop = false
  preload = ""
  volume = 1
  src = ""
  play = vi.fn(async () => undefined)
  pause = vi.fn()

  constructor(src?: string) {
    if (src) this.src = src
  }
}

function installBrowser(muted: string | null = null) {
  const storage = new Map<string, string>()
  if (muted !== null) storage.set("noe_v2_muted", muted)

  vi.stubGlobal("window", {
    AudioContext: FakeAudioContext,
    Audio: FakeHtmlAudio,
    localStorage: {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    },
  })
  vi.stubGlobal("Audio", FakeHtmlAudio)

  return storage
}

describe("audio helpers", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    FakeAudioContext.instances = []
  })

  it("persists and restores mute preference", async () => {
    const storage = installBrowser("true")
    const audio = await import("./audio")

    expect(audio.isMuted()).toBe(true)

    audio.setMuted(false)

    expect(audio.isMuted()).toBe(false)
    expect(storage.get("noe_v2_muted")).toBe("false")
  })

  it("unlocks the audio context after a user gesture", async () => {
    installBrowser()
    const audio = await import("./audio")

    await audio.unlock()

    expect(FakeAudioContext.instances).toHaveLength(1)
    expect(FakeAudioContext.instances[0].resume).toHaveBeenCalledOnce()
  })

  it("synthesizes effects only after unlock and while unmuted", async () => {
    installBrowser()
    const audio = await import("./audio")

    audio.playSfx("collect")
    expect(FakeAudioContext.instances).toHaveLength(0)

    await audio.unlock()
    const context = FakeAudioContext.instances[0]
    audio.playSfx("shield")
    expect(context.createOscillator).toHaveBeenCalled()

    const oscillatorCount = context.createOscillator.mock.calls.length
    audio.setMuted(true)
    audio.playSfx("hit")
    expect(context.createOscillator).toHaveBeenCalledTimes(oscillatorCount)
  })
})
