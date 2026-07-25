import React, { createContext, useContext, useState, useEffect } from 'react'

const SoundContext = createContext({
  soundEnabled: true,
  setSoundEnabled: () => {},
  playSuccess: () => {},
  playFailure: () => {},
})

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('sound_enabled')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('sound_enabled', JSON.stringify(soundEnabled))
  }, [soundEnabled])

  // Synthesize short premium bell sound
  const playSuccess = () => {
    if (!soundEnabled) return

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // Primary chime tone (E6 ~ 1318Hz)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(1318.51, ctx.currentTime)
      
      // Secondary chime tone (G#6 ~ 1661Hz) for royal major third chord
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1661.22, ctx.currentTime)

      // Envelope configuration
      gain1.gain.setValueAtTime(0.15, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

      gain2.gain.setValueAtTime(0.10, ctx.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

      // Connections
      osc1.connect(gain1)
      gain1.connect(ctx.destination)

      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      // Start and Stop
      osc1.start(ctx.currentTime)
      osc1.stop(ctx.currentTime + 0.6)
      osc2.start(ctx.currentTime)
      osc2.stop(ctx.currentTime + 0.4)
    } catch (e) {
      console.warn('Web Audio success playback failed:', e)
    }
  }

  // Synthesize error buzzer/beep sound
  const playFailure = () => {
    if (!soundEnabled) return

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // Low pitch buzzer tone (150Hz)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, ctx.currentTime)

      // Simple low pass filter to make the sawtooth sound less harsh and more professional
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, ctx.currentTime)

      // Play twice quickly for a "double beep" alert feel
      gain.gain.setValueAtTime(0, ctx.currentTime)
      
      // First beep
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      
      // Second beep
      gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.2)
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35)

      // Connections
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      // Start and Stop
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) {
      console.warn('Web Audio failure playback failed:', e)
    }
  }

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled, playSuccess, playFailure }}>
      {children}
    </SoundContext.Provider>
  )
}

export const useSound = () => useContext(SoundContext)
