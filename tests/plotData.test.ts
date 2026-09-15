import { describe, expect, it } from 'vitest'
import { wrapPhiDegrees, wrapPhiRadians, wrappedPlotSegments } from '../src/visualization/plotData'

describe('wrapped plot data', () => {
  it('wraps phi into (-pi, pi] and (-180, 180]', () => {
    expect(wrapPhiRadians(0)).toBeCloseTo(0, 14)
    expect(wrapPhiRadians(Math.PI)).toBeCloseTo(Math.PI, 14)
    expect(wrapPhiRadians(-Math.PI)).toBeCloseTo(Math.PI, 14)
    expect(wrapPhiDegrees(3 * Math.PI / 2)).toBeCloseTo(-90, 12)
    expect(wrapPhiDegrees(-3 * Math.PI / 2)).toBeCloseTo(90, 12)
  })

  it('splits lines at the wrapped-angle discontinuity', () => {
    const trajectory = [
      { t: 0, r: 1, phi: (170 * Math.PI) / 180 },
      { t: 1, r: 1.01, phi: (179 * Math.PI) / 180 },
      { t: 2, r: 1.02, phi: (181 * Math.PI) / 180 },
      { t: 3, r: 1.03, phi: (190 * Math.PI) / 180 },
    ]

    const segments = wrappedPlotSegments(trajectory)
    expect(segments).toHaveLength(2)
    expect(segments[0][0].phiDegrees).toBeCloseTo(170, 12)
    expect(segments[0][1].phiDegrees).toBeCloseTo(179, 12)
    expect(segments[1][0].phiDegrees).toBeCloseTo(-179, 12)
    expect(segments[1][1].phiDegrees).toBeCloseTo(-170, 12)
  })
})
