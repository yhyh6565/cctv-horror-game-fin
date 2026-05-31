import { useEffect, useRef } from 'react'
import type { RefObject, MutableRefObject } from 'react'

const MAX_OFFSET = 32  // px, max background shift in each direction
const LERP = 0.06      // smoothing: lower = smoother but slower to respond

export function useFaceTracking(
  videoRef: RefObject<HTMLVideoElement | null>
): MutableRefObject<{ x: number; y: number }> {
  const offsetRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let faceDetection: any
    let rafId: number
    let processing = false

    async function init() {
      const { FaceDetection } = await import('@mediapipe/face_detection')

      faceDetection = new FaceDetection({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      })
      faceDetection.setOptions({ model: 'short', minDetectionConfidence: 0.5 })

      faceDetection.onResults((results: any) => {
        processing = false
        if (!results.detections || results.detections.length === 0) return

        const box = results.detections[0].boundingBox
        // box.xCenter, box.yCenter: normalized 0–1 (face center in raw camera frame)
        // Invert X: face-left → bg shifts right (parallax "looking through window")
        targetRef.current.x = -(box.xCenter - 0.5) * MAX_OFFSET * 2
        targetRef.current.y = -(box.yCenter - 0.5) * MAX_OFFSET
      })

      function loop() {
        // Lerp current offset toward target each frame
        offsetRef.current.x += (targetRef.current.x - offsetRef.current.x) * LERP
        offsetRef.current.y += (targetRef.current.y - offsetRef.current.y) * LERP

        // Send frame to face detector (skip if previous frame still processing)
        if (!processing && videoRef.current && videoRef.current.readyState >= 2) {
          processing = true
          Promise.resolve(faceDetection.send({ image: videoRef.current })).catch(() => {
            processing = false
          })
        }

        rafId = requestAnimationFrame(loop)
      }
      loop()
    }

    init()
    return () => {
      cancelAnimationFrame(rafId)
      faceDetection?.close()
    }
  }, [videoRef])

  return offsetRef
}
