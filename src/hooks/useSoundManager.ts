import { useCallback, useEffect, useRef } from 'react'
import { Howl } from 'howler'

const SFX_FILES = {
  elevator_loop: '/sounds/elevator_loop.mp3',
  door_creak: '/sounds/door_creak.mp3',
  ghost_signal: '/sounds/ghost_signal.mp3',
  mirror_bang: '/sounds/mirror_bang.mp3',
  mirror_shatter: '/sounds/mirror_shatter.mp3',
  ghost_laugh: '/sounds/ghost_laugh.mp3',
  jumpscare: '/sounds/jumpscare.mp3',
  whisper: '/sounds/whisper.mp3',
  glitch: '/sounds/glitch.mp3',
  dead_sting: '/sounds/dead_sting.mp3',
  bad_drone: '/sounds/bad_drone.mp3',
  whiteout: '/sounds/whiteout.mp3',
} as const

type SfxKey = keyof typeof SFX_FILES

export function useSoundManager() {
  const sounds = useRef<Partial<Record<SfxKey, Howl>>>({})
  const muted = useRef(false)

  useEffect(() => {
    return () => {
      Object.values(sounds.current).forEach(h => { h?.stop(); h?.unload() })
    }
  }, [])

  const play = useCallback((key: SfxKey) => {
    if (muted.current) return
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
