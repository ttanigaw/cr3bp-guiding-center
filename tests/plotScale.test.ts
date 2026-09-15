import { describe, expect, it } from 'vitest'
import {
  anchoredTicks,
  closeUpPhiRange,
  niceCeilingMagnitude,
  niceOuterRange,
  selectLagrangeAnchor,
  zeroAnchoredNiceRange,
} from '../src/visualization/plotScale'

describe('phase-space plot scale helpers', () => {
  it('rounds magnitudes outward to the 1-2-5 sequence', () => {
    expect(niceCeilingMagnitude(0.064)).toBeCloseTo(0.1, 14)
    expect(niceCeilingMagnitude(0.021)).toBeCloseTo(0.05, 14)
    expect(niceCeilingMagnitude(0.014)).toBeCloseTo(0.02, 14)
    expect(niceCeilingMagnitude(0.008)).toBeCloseTo(0.01, 14)
  })

  it('builds a nice outer radial-offset range while retaining corotation', () => {
    expect(niceOuterRange([0.01, 0.064], 0, 0.02)).toEqual({ min: 0, max: 0.1 })
    expect(niceOuterRange([-0.064, -0.01], 0, 0.02)).toEqual({ min: -0.1, max: 0 })
    expect(niceOuterRange([-0.031, 0.064], 0, 0.02)).toEqual({ min: -0.05, max: 0.1 })
  })

  it('builds a tight zero-anchored range from a shared nice tick step', () => {
    expect(zeroAnchoredNiceRange([-0.018, 0.014], 0.02)).toEqual({ min: -0.02, max: 0.02 })
    expect(zeroAnchoredNiceRange([-0.031, 0.014], 0.02)).toEqual({ min: -0.04, max: 0.02 })

    const minimumSpanRange = zeroAnchoredNiceRange([-0.003, 0.004], 0.02)
    expect(minimumSpanRange.min).toBeLessThanOrEqual(-0.01)
    expect(minimumSpanRange.max).toBeGreaterThanOrEqual(0.01)
  })

  it('chooses the L4 or L5 longitude represented by the close-up data', () => {
    expect(selectLagrangeAnchor([55, 60, 72, 81])).toBe(60)
    expect(selectLagrangeAnchor([-82, -76, -64, -57])).toBe(-60)
  })

  it('narrows the phi range while guaranteeing that its Lagrange anchor remains visible', () => {
    expect(closeUpPhiRange([55, 60, 72, 81], 60)).toEqual({ min: 50, max: 85 })
    expect(closeUpPhiRange([-82, -76, -64, -57], -60)).toEqual({ min: -85, max: -55 })

    const nearWrap = closeUpPhiRange([-179, 179], 60)
    expect(nearWrap.min).toBeGreaterThanOrEqual(-180)
    expect(nearWrap.max).toBeLessThanOrEqual(180)
  })

  it('builds equal-spacing ticks anchored to a specified reference value', () => {
    expect(anchoredTicks({ min: 50, max: 85 }, 60)).toEqual([50, 60, 70, 80])
    expect(anchoredTicks({ min: -0.05, max: 0.1 }, 0)).toEqual([-0.05, 0, 0.05, 0.1])
  })
})
