import { describe, expect, it } from 'vitest'
import {
  trajectoryPointAtTime,
  trajectoryTrailAtTime,
} from '../src/visualization/playback'

const trajectory = [
  { t: 0, r: 1, phi: 0 },
  { t: 1, r: 2, phi: 2 },
  { t: 2, r: 4, phi: 6 },
]

describe('trajectory playback helpers', () => {
  it('interpolates a display state without modifying stored points', () => {
    const point = trajectoryPointAtTime(trajectory, 0.25)

    expect(point).toEqual({ t: 0.25, r: 1.25, phi: 0.5 })
    expect(trajectory[0]).toEqual({ t: 0, r: 1, phi: 0 })
    expect(trajectory[1]).toEqual({ t: 1, r: 2, phi: 2 })
  })

  it('clamps display time to the trajectory endpoints', () => {
    expect(trajectoryPointAtTime(trajectory, -10)).toBe(trajectory[0])
    expect(trajectoryPointAtTime(trajectory, 10)).toBe(trajectory[2])
  })

  it('selects a recent trail with interpolated boundaries', () => {
    const trail = trajectoryTrailAtTime(trajectory, 1.75, 1)

    expect(trail).toEqual([
      { t: 0.75, r: 1.75, phi: 1.5 },
      { t: 1, r: 2, phi: 2 },
      { t: 1.75, r: 3.5, phi: 5 },
    ])
  })

  it('uses the trajectory start when the requested trail extends before t = 0', () => {
    expect(trajectoryTrailAtTime(trajectory, 0.5, 10)).toEqual([
      trajectory[0],
      { t: 0.5, r: 1.5, phi: 1 },
    ])
  })
})
