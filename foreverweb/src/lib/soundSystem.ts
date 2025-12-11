// Sound effects system for Crimson Core
const audioContext = (() => {
  try {
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    return ac
  } catch {
    return null
  }
})()

export const soundSystem = {
  enabled: localStorage.getItem('forever:soundOn') !== 'false',

  toggle: () => {
    soundSystem.enabled = !soundSystem.enabled
    localStorage.setItem('forever:soundOn', String(soundSystem.enabled))
  },

  // boot sequence beep
  bootBeep: () => {
    if (!audioContext || !soundSystem.enabled) return
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.frequency.setValueAtTime(400, audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.08)
    gain.gain.setValueAtTime(0.1, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08)
    osc.start(audioContext.currentTime)
    osc.stop(audioContext.currentTime + 0.08)
  },

  // window open sound
  windowOpen: () => {
    if (!audioContext || !soundSystem.enabled) return
    const now = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.02, now + 0.1)
    osc.start(now)
    osc.stop(now + 0.1)
  },

  // button click (short chirp)
  click: () => {
    if (!audioContext || !soundSystem.enabled) return
    const now = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.frequency.setValueAtTime(800, now)
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
    osc.start(now)
    osc.stop(now + 0.05)
  },

  // window close (descending tone)
  windowClose: () => {
    if (!audioContext || !soundSystem.enabled) return
    const now = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)
    osc.frequency.setValueAtTime(700, now)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.2)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
    osc.start(now)
    osc.stop(now + 0.2)
  }
}
