import { describe, expect, it } from 'vitest'
import {
  inertialAxesInRotatingFrame,
  inertialBodyPositions,
  inertialCartesian,
  inertialLagrangePositions,
  rotatingCartesian,
} from '../src/visualization/frames'

describe('frame coordinate transforms', () => {
  it('matches rotating coordinates at t = 0', () => {
    const state = { r: 1.2, phi: 0.7, t: 0 }
    const rotating = rotatingCartesian(state)
    const inertial = inertialCartesian(state)

    expect(inertial.x).toBeCloseTo(rotating.x, 14)
    expect(inertial.y).toBeCloseTo(rotating.y, 14)
  })

  it('rotates a phi = 0 point by one quarter turn at t = pi/2', () => {
    const inertial = inertialCartesian({ r: 1, phi: 0, t: Math.PI / 2 })

    expect(inertial.x).toBeCloseTo(0, 14)
    expect(inertial.y).toBeCloseTo(1, 14)
  })

  it('shows inertial axes rotating clockwise in the rotating frame', () => {
    const axes = inertialAxesInRotatingFrame(Math.PI / 2)

    expect(axes.xPositive.x).toBeCloseTo(0, 14)
    expect(axes.xPositive.y).toBeCloseTo(-1, 14)
    expect(axes.yPositive.x).toBeCloseTo(1, 14)
    expect(axes.yPositive.y).toBeCloseTo(0, 14)
  })

  it('rotates the binary rigidly in the inertial frame', () => {
    const mu = 0.1
    const positions = inertialBodyPositions(mu, Math.PI / 2)

    expect(positions.primary.x).toBeCloseTo(0, 14)
    expect(positions.primary.y).toBeCloseTo(-mu, 14)
    expect(positions.secondary.x).toBeCloseTo(0, 14)
    expect(positions.secondary.y).toBeCloseTo(1 - mu, 14)
  })

  it('preserves the equilateral L4/L5 geometry under inertial rotation', () => {
    const mu = 0.001
    const positions = inertialLagrangePositions(mu, 0.37)
    const primary = inertialBodyPositions(mu, 0.37).primary
    const secondary = inertialBodyPositions(mu, 0.37).secondary

    const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y)

    expect(distance(positions.l4, primary)).toBeCloseTo(1, 14)
    expect(distance(positions.l4, secondary)).toBeCloseTo(1, 14)
    expect(distance(positions.l5, primary)).toBeCloseTo(1, 14)
    expect(distance(positions.l5, secondary)).toBeCloseTo(1, 14)
  })
})
