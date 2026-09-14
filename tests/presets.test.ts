import { describe, expect, it } from 'vitest'
import { reducedHamiltonian, tidalParameter } from '../src/physics/guidingCenter'
import { integrateGuidingCenter } from '../src/physics/integrator'
import { orbitPresets } from '../src/physics/presets'

function maxAbsoluteHamiltonianDrift(
  trajectory: ReturnType<typeof integrateGuidingCenter>,
  mu: number,
): number {
  const initialHamiltonian = reducedHamiltonian(trajectory[0], mu)

  return Math.max(
    ...trajectory.map((point) =>
      Math.abs(reducedHamiltonian(point, mu) - initialHamiltonian),
    ),
  )
}

describe('validated co-orbital presets', () => {
  it('produces a wide horseshoe libration without close conjunction', () => {
    const preset = orbitPresets.horseshoe
    const trajectory = integrateGuidingCenter(preset.initialState, preset.mu, {
      dt: preset.dt,
      tMax: preset.tMax,
    })

    const radii = trajectory.map(({ r }) => r)
    const phis = trajectory.map(({ phi }) => phi)
    const tidalStrengths = trajectory.map((point) => tidalParameter(point, preset.mu))

    expect(Math.min(...radii)).toBeLessThan(0.97)
    expect(Math.max(...radii)).toBeGreaterThan(1.03)
    expect(Math.min(...phis)).toBeGreaterThan(0.3)
    expect(Math.max(...phis)).toBeLessThan(2 * Math.PI - 0.3)
    expect(Math.max(...phis) - Math.min(...phis)).toBeGreaterThan(5)
    expect(Math.max(...tidalStrengths)).toBeLessThan(0.02)
    expect(maxAbsoluteHamiltonianDrift(trajectory, preset.mu)).toBeLessThan(1e-9)
  })

  it('keeps the L4 tadpole on the leading side', () => {
    const preset = orbitPresets['l4-tadpole']
    const trajectory = integrateGuidingCenter(preset.initialState, preset.mu, {
      dt: preset.dt,
      tMax: preset.tMax,
    })

    const phis = trajectory.map(({ phi }) => phi)
    const radii = trajectory.map(({ r }) => r)

    expect(Math.min(...phis)).toBeGreaterThan(0.7)
    expect(Math.max(...phis)).toBeLessThan(1.5)
    expect(Math.max(...phis) - Math.min(...phis)).toBeGreaterThan(0.5)
    expect(Math.min(...radii)).toBeGreaterThan(0.97)
    expect(Math.max(...radii)).toBeLessThan(1.03)
    expect(maxAbsoluteHamiltonianDrift(trajectory, preset.mu)).toBeLessThan(1e-10)
  })

  it('keeps the L5 tadpole on the trailing side', () => {
    const preset = orbitPresets['l5-tadpole']
    const trajectory = integrateGuidingCenter(preset.initialState, preset.mu, {
      dt: preset.dt,
      tMax: preset.tMax,
    })

    const phis = trajectory.map(({ phi }) => phi)
    const radii = trajectory.map(({ r }) => r)

    expect(Math.min(...phis)).toBeGreaterThan(-1.5)
    expect(Math.max(...phis)).toBeLessThan(-0.7)
    expect(Math.max(...phis) - Math.min(...phis)).toBeGreaterThan(0.5)
    expect(Math.min(...radii)).toBeGreaterThan(0.97)
    expect(Math.max(...radii)).toBeLessThan(1.03)
    expect(maxAbsoluteHamiltonianDrift(trajectory, preset.mu)).toBeLessThan(1e-10)
  })
})
