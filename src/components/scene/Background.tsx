import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

interface Props {
  image: string  // 'bg_0' ~ 'bg_4' | 'bg_win_mirror' | 'bg_bad_ending'
  brightness?: number  // 0-1, default 1
  faceOffsetRef?: RefObject<{ x: number; y: number }>
}

export default function Background({ image, brightness = 1, faceOffsetRef }: Props) {
  const divRef = useRef<HTMLDivElement>(null)

  // Apply face parallax offset directly to DOM — avoids React re-renders at 60fps
  useEffect(() => {
    if (!faceOffsetRef) return
    let rafId: number
    function loop() {
      if (divRef.current) {
        const { x, y } = faceOffsetRef!.current
        divRef.current.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(1.08)`
      }
      rafId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(rafId)
  }, [faceOffsetRef])

  return (
    <div
      ref={divRef}
      className="absolute inset-0 z-10 bg-center bg-cover"
      style={{
        backgroundImage: `url(/images/${image}.png)`,
        filter: `brightness(${brightness}) contrast(1.1) saturate(0.8)`,
        transition: 'filter 1000ms',
      }}
    />
  )
}
