import { useRef, useEffect, useState, useCallback } from 'react'

interface Props {
  palmX: number | null  // 0-1 normalized (null = no hand)
  onComplete: () => void
}

const COMPLETE_THRESHOLD = 0.8

export default function FrostWipe({ palmX, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevPalmX = useRef<number | null>(null)
  const [progress, setProgress] = useState(0)
  const completedRef = useRef(false)

  // Initialize canvas with frost overlay
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx.fillStyle = 'rgba(200, 220, 255, 0.85)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const wipe = useCallback((x: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const cx = x * canvas.width
    const brushRadius = canvas.width * 0.08

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(cx, canvas.height / 2, brushRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'

    // Calculate progress (% of transparent pixels)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let transparent = 0
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 10) transparent++
    }
    const total = canvas.width * canvas.height
    const pct = transparent / total
    setProgress(pct)

    if (pct >= COMPLETE_THRESHOLD && !completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  }, [onComplete])

  useEffect(() => {
    if (palmX === null) { prevPalmX.current = null; return }
    if (prevPalmX.current !== null) {
      const moved = Math.abs(palmX - prevPalmX.current) > 0.01
      if (moved) wipe(palmX)
    }
    prevPalmX.current = palmX
  }, [palmX, wipe])

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 z-40 pointer-events-none" />
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 text-white text-xs font-mono">
        {Math.round(progress * 100)}% 닦음
      </div>
    </>
  )
}
