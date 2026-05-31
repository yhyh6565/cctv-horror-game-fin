import { useCallback, useEffect, useRef } from 'react'
import { Howl } from 'howler'

const SFX_FILES = {
  elevator_loop: '/sounds/elevator_loop.mp3',
  door_creak: '/sounds/door_creak.mp3',
  ghost_signal: '/sounds/ghost_signal.mp3',
  mirror_bang: '/sounds/mirror_bang.wav',
  mirror_shatter: '/sounds/mirror_shatter.mp3',
  ghost_laugh: '/sounds/ghost_laugh.mp3',
  jumpscare: '/sounds/jumpscare.mp3',
  whisper: '/sounds/whisper.wav',
  glitch: '/sounds/glitch.mp3',
  dead_sting: '/sounds/dead_sting.mp3',
  bad_drone: '/sounds/bad_drone.ogg',
  whiteout: '/sounds/whiteout.mp3',
} as const

type SfxKey = keyof typeof SFX_FILES

function playElevatorDing() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    // 엘리베이터 '띵' — 맑은 종소리 (880Hz + 2차 하모닉)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.45, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1.2)
    // 서스테인 후 ctx 정리
    osc.onended = () => ctx.close()
  } catch {
    // AudioContext not available (e.g., server-side)
  }
}

export function useSoundManager() {
  const sounds = useRef<Partial<Record<SfxKey, Howl>>>({})
  const muted = useRef(false)

  useEffect(() => {
    return () => {
      Object.values(sounds.current).forEach(h => { h?.stop(); h?.unload() })
    }
  }, [])

  const play = useCallback((key: SfxKey | 'elevator_ding') => {
    if (muted.current) return
    if (key === 'elevator_ding') {
      playElevatorDing()
      return
    }
    if (!sounds.current[key]) {
      sounds.current[key] = new Howl({ src: [SFX_FILES[key]], preload: true })
    }
    sounds.current[key]!.play()
  }, [])

  const stop = useCallback((key: SfxKey) => {
    sounds.current[key]?.stop()
  }, [])

  const toggleMute = useCallback(() => {
    muted.current = !muted.current
  }, [])

  return { play, stop, toggleMute }
}
