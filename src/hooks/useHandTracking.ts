import { useEffect, useRef, useCallback } from 'react'
import type { RefObject } from 'react'
import type { Gesture } from '../types/game'

type Landmark = { x: number; y: number; z: number }

export function classifyGesture(lm: Landmark[]): Gesture {
  const fingerUp = (tipIdx: number, pipIdx: number) => lm[tipIdx].y < lm[pipIdx].y
  const indexUp = fingerUp(8, 6)
  const middleUp = fingerUp(12, 10)
  const ringUp = fingerUp(16, 14)
  const pinkyUp = fingerUp(20, 18)

  if (!indexUp && !middleUp && !ringUp && !pinkyUp) return 'rock'
  if (indexUp && middleUp && ringUp && pinkyUp) return 'paper'
  if (indexUp && middleUp && !ringUp && !pinkyUp) return 'scissors'
  return 'none'
}

export function isPointing(lm: Landmark[]): boolean {
  const fingerUp = (tipIdx: number, pipIdx: number) => lm[tipIdx].y < lm[pipIdx].y
  return fingerUp(8, 6) && !fingerUp(12, 10) && !fingerUp(16, 14) && !fingerUp(20, 18)
}

export function getPalmCenterX(lm: Landmark[]): number {
  return lm[0].x  // wrist X, normalized 0-1
}

interface HandTrackingOptions {
  onGesture: (g: Gesture) => void
  onHandLost: (seconds: number) => void
  onPointing: (isPointing: boolean) => void
  onPalmX: (x: number) => void
  videoRef: RefObject<HTMLVideoElement | null>
}

export function useHandTracking({
  onGesture, onHandLost, onPointing: onPointingCb, onPalmX, videoRef
}: HandTrackingOptions) {
  const handLostStart = useRef<number | null>(null)
  const gestureHoldStart = useRef<number | null>(null)
  const lastGesture = useRef<Gesture>('none')
  const GESTURE_HOLD_MS = 800

  const handleResults = useCallback((results: any) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      if (!handLostStart.current) handLostStart.current = Date.now()
      const elapsed = (Date.now() - handLostStart.current) / 1000
      onHandLost(elapsed)
      gestureHoldStart.current = null
      lastGesture.current = 'none'
      onPointingCb(false)
      return
    }

    handLostStart.current = null
    onHandLost(0)

    const lm = results.multiHandLandmarks[0]
    const gesture = classifyGesture(lm)
    const pointing = isPointing(lm)
    const palmX = getPalmCenterX(lm)

    onPointingCb(pointing)
    onPalmX(palmX)

    if (gesture !== lastGesture.current) {
      lastGesture.current = gesture
      gestureHoldStart.current = gesture !== 'none' ? Date.now() : null
    } else if (gesture !== 'none' && gestureHoldStart.current) {
      const held = Date.now() - gestureHoldStart.current
      if (held >= GESTURE_HOLD_MS) {
        onGesture(gesture)
        gestureHoldStart.current = null  // 재트리거 방지
      }
    }
  }, [onGesture, onHandLost, onPointingCb, onPalmX])

  useEffect(() => {
    let hands: any
    let camera: any

    async function init() {
      const { Hands } = await import('@mediapipe/hands')
      const { Camera } = await import('@mediapipe/camera_utils')

      hands = new Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      })
      hands.onResults(handleResults)

      if (videoRef.current) {
        camera = new Camera(videoRef.current, {
          onFrame: async () => { await hands.send({ image: videoRef.current }) },
          width: 640,
          height: 480,
        })
        camera.start()
      }
    }

    init()
    return () => { camera?.stop(); hands?.close() }
  }, [handleResults, videoRef])
}
