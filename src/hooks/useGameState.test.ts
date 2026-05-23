import { describe, it, expect } from 'vitest'
import { resolvePhase1, resolvePhase2 } from './useGameState'
import { getGhostQuestion } from '../data/ghostQuestions'

describe('Phase 1 RPS', () => {
  it('paper always ties', () => {
    expect(resolvePhase1('paper')).toBe('tie')
  })
  it('rock always loses', () => {
    expect(resolvePhase1('rock')).toBe('loss')
  })
  it('scissors always loses', () => {
    expect(resolvePhase1('scissors')).toBe('loss')
  })
})

describe('Phase 2 RPS', () => {
  it('rock always loses', () => {
    expect(resolvePhase2('rock', 1, false)).toBe('loss')
  })
  it('paper always loses', () => {
    expect(resolvePhase2('paper', 1, false)).toBe('loss')
  })
  it('scissors in round 3 always wins (pen trick)', () => {
    expect(resolvePhase2('scissors', 3, false)).toBe('win')
  })
  it('scissors in round 1/2 resolves randomly (stub)', () => {
    // 결과는 'win' 또는 'loss' 중 하나
    const result = resolvePhase2('scissors', 1, false)
    expect(['win', 'loss']).toContain(result)
  })
})

describe('Ghost questions', () => {
  it('returns question by index', () => {
    expect(getGhostQuestion(0)?.question).toBe('이름이 뭐야?')
    expect(getGhostQuestion(1)?.question).toBe('생일이 언제야?')
    expect(getGhostQuestion(2)?.question).toBe('지금 무서워?')
  })
})
