import { describe, it, expect } from 'vitest'
import { classifyGesture, isPointing, getPalmCenterX } from './useHandTracking'

// MediaPipe landmark 인덱스: 0=wrist, 4=thumb_tip, 6=index_pip, 8=index_tip,
// 10=middle_pip, 12=middle_tip, 14=ring_pip, 16=ring_tip, 18=pinky_pip, 20=pinky_tip

function makeLandmarks(overrides: Record<number, { x: number; y: number; z: number }>) {
  const base = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }))
  Object.entries(overrides).forEach(([i, v]) => { base[Number(i)] = v })
  return base
}

describe('classifyGesture', () => {
  it('detects rock (all fingers down)', () => {
    const lm = makeLandmarks({
      6: { x: 0.5, y: 0.4, z: 0 }, 8: { x: 0.5, y: 0.5, z: 0 },  // index down
      10: { x: 0.5, y: 0.4, z: 0 }, 12: { x: 0.5, y: 0.5, z: 0 }, // middle down
      14: { x: 0.5, y: 0.4, z: 0 }, 16: { x: 0.5, y: 0.5, z: 0 }, // ring down
      18: { x: 0.5, y: 0.4, z: 0 }, 20: { x: 0.5, y: 0.5, z: 0 }, // pinky down
    })
    expect(classifyGesture(lm)).toBe('rock')
  })

  it('detects paper (all fingers up)', () => {
    const lm = makeLandmarks({
      6: { x: 0.5, y: 0.5, z: 0 }, 8: { x: 0.5, y: 0.3, z: 0 },
      10: { x: 0.5, y: 0.5, z: 0 }, 12: { x: 0.5, y: 0.3, z: 0 },
      14: { x: 0.5, y: 0.5, z: 0 }, 16: { x: 0.5, y: 0.3, z: 0 },
      18: { x: 0.5, y: 0.5, z: 0 }, 20: { x: 0.5, y: 0.3, z: 0 },
    })
    expect(classifyGesture(lm)).toBe('paper')
  })

  it('detects scissors (index + middle up, others down)', () => {
    const lm = makeLandmarks({
      6: { x: 0.5, y: 0.5, z: 0 }, 8: { x: 0.5, y: 0.3, z: 0 },  // index up
      10: { x: 0.5, y: 0.5, z: 0 }, 12: { x: 0.5, y: 0.3, z: 0 }, // middle up
      14: { x: 0.5, y: 0.4, z: 0 }, 16: { x: 0.5, y: 0.5, z: 0 }, // ring down
      18: { x: 0.5, y: 0.4, z: 0 }, 20: { x: 0.5, y: 0.5, z: 0 }, // pinky down
    })
    expect(classifyGesture(lm)).toBe('scissors')
  })
})

describe('isPointing', () => {
  it('detects pointing (index only up)', () => {
    const lm = makeLandmarks({
      6: { x: 0.5, y: 0.5, z: 0 }, 8: { x: 0.5, y: 0.3, z: 0 },  // index up
      10: { x: 0.5, y: 0.4, z: 0 }, 12: { x: 0.5, y: 0.5, z: 0 }, // middle down
      14: { x: 0.5, y: 0.4, z: 0 }, 16: { x: 0.5, y: 0.5, z: 0 }, // ring down
      18: { x: 0.5, y: 0.4, z: 0 }, 20: { x: 0.5, y: 0.5, z: 0 }, // pinky down
    })
    expect(isPointing(lm)).toBe(true)
  })
})

describe('getPalmCenterX', () => {
  it('returns wrist X coordinate', () => {
    const lm = makeLandmarks({ 0: { x: 0.4, y: 0.8, z: 0 } })
    expect(getPalmCenterX(lm)).toBe(0.4)
  })
})
