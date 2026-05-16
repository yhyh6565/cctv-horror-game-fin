import { describe, it, expect } from 'vitest'
import { SCENES } from './scenes'
import { matchKeyword } from './endingKeywords'

describe('Scene data', () => {
  it('all scenes have at least one line', () => {
    const required = ['SCENE_01', 'SCENE_02', 'SCENE_03'] as const
    required.forEach(id => {
      expect(SCENES[id].length).toBeGreaterThan(0)
    })
  })
  it('all lines have type and text', () => {
    Object.values(SCENES).flat().forEach(line => {
      expect(line.type).toBeTruthy()
      expect(line.text).toBeTruthy()
    })
  })
})

describe('Keyword matching', () => {
  it('matches 돌아가', () => {
    expect(matchKeyword('집에 돌아갈 수 있어?')).toBe('돌아갈 수 있다. 반드시.')
  })
  it('matches 살', () => {
    expect(matchKeyword('살 수 있어?')).toBe('살 수 있다.')
  })
  it('returns null for no match', () => {
    expect(matchKeyword('오늘 날씨 어때?')).toBeNull()
  })
})
