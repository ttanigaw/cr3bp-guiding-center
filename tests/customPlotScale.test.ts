import { describe, expect, it } from 'vitest'
import {
  buildAxisScale,
  isLogScaleAvailable,
  niceTicks,
  transformAxisValue,
} from '../src/visualization/customPlotScale'

describe('custom diagnostic plot axis scaling', () => {
  it('anchors linear ticks to zero with equal nice-number spacing when zero is visible', () => {
    const ticks = niceTicks({ min: -0.0022, max: 0.0014 })

    expect(ticks).toEqual([-0.002, -0.001, 0, 0.001])
    const differences = ticks.slice(1).map((value, index) => value - ticks[index])
    for (const difference of differences) {
      expect(difference).toBeCloseTo(0.001, 12)
    }
  })

  it('keeps a one-sided zero reference at the edge while using zero as a tick anchor', () => {
    const layout = buildAxisScale([0, 0.2, 0.7, 1], 0.001, 0, 'linear')

    expect(layout.range.min).toBe(0)
    expect(layout.ticks).toContain(0)
    expect(layout.ticks.every((tick) => tick >= 0)).toBe(true)
  })

  it('fits tiny but resolved conservation errors to their actual span instead of the fallback span', () => {
    const layout = buildAxisScale([0, -4e-16, -1.7e-15, -8e-16], 1e-13, 0, 'linear')

    expect(layout.range.max).toBe(0)
    expect(layout.range.min).toBeLessThanOrEqual(-1.7e-15)
    expect(layout.range.min).toBeGreaterThan(-1e-14)
    expect(layout.ticks).toContain(0)
    expect(layout.ticks.some((tick) => tick < 0)).toBe(true)
  })

  it('uses the fallback span only when a nonzero-baseline range is effectively degenerate', () => {
    const layout = buildAxisScale([1, 1 + 1e-14], 0.002, 1, 'linear')

    expect(layout.range.min).toBe(1)
    expect(layout.range.max - layout.range.min).toBeGreaterThanOrEqual(0.002)
    expect(layout.range.max - layout.range.min).toBeLessThan(0.003)
  })

  it('preserves ordinary finite-width auto-fit without forcing the fallback span', () => {
    const layout = buildAxisScale([0.982, 1, 1.018], 0.002, 1, 'linear')

    expect(layout.range.min).toBeLessThan(0.982)
    expect(layout.range.max).toBeGreaterThan(1.018)
    expect(layout.range.max - layout.range.min).toBeLessThan(0.05)
    expect(layout.transformedReference).toBe(1)
  })

  it('creates a finite fallback range for exactly constant data', () => {
    const layout = buildAxisScale([0, 0, 0], 0.002, 0, 'linear')

    expect(layout.range.min).toBeLessThan(0)
    expect(layout.range.max).toBeGreaterThan(0)
    expect(layout.range.max - layout.range.min).toBeGreaterThanOrEqual(0.002)
    expect(layout.ticks).toContain(0)
  })

  it('allows log10 only when every plotted value is strictly positive', () => {
    expect(isLogScaleAvailable([0.001, 1, 10])).toBe(true)
    expect(isLogScaleAvailable([0, 1, 10])).toBe(false)
    expect(isLogScaleAvailable([-1, 1, 10])).toBe(false)
    expect(isLogScaleAvailable([])).toBe(false)
  })

  it('uses log10-transformed coordinates and preserves positive reference values', () => {
    const layout = buildAxisScale([0.8, 1, 1.2], 0.002, 1, 'log10')

    expect(transformAxisValue(0.01, 'log10')).toBe(-2)
    expect(layout.transformedReference).toBe(0)
    expect(layout.range.min).toBeLessThan(0)
    expect(layout.range.max).toBeGreaterThan(0)
    expect(layout.ticks).toContain(0)
  })

  it('rejects log10 layout for nonpositive values', () => {
    expect(() => buildAxisScale([0, 1], 0.001, undefined, 'log10')).toThrow(/strictly positive/)
  })
})
