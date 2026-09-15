import { describe, expect, it } from 'vitest'
import { closeUpPhiRange, niceCeilingMagnitude, niceOuterRange } from '../src/visualization/plotScale'

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

  it('narrows the phi range for close-up views and keeps it inside the wrapped interval', () => {
    expect(closeUpPhiRange([55, 60, 72, 81])).toEqual({ min: 50, max: 85 })
    expect(closeUpPhiRange([-82, -76, -64, -57])).toEqual({ min: -85, max: -55 })

    const nearWrap = closeUpPhiRange([-179, 179])
    expect(nearWrap.min).toBeGreaterThanOrEqual(-180)
    expect(nearWrap.max).toBeLessThanOrEqual(180)
  })
})
