import { describe, expect, it } from 'vitest'
import { integrateGuidingCenter, rk4Step } from '../src/physics/integrator'
import { reducedHamiltonian } from '../src/physics/guidingCenter'

function maxHamiltonianError(
  trajectory: ReturnType<typeof integrateGuidingCenter>,
  mu: number,
): number {
  const initial = reducedHamiltonian(trajectory[0], mu)
  return Math.max(
    ...trajectory.map((point) => Math.abs(reducedHamiltonian(point, mu) - initial)),
  )
}

describe('guiding-center RK4 integrator', () => {
  it('reproduces the analytic mu=0 solution', () => {
    const initial = { r: 1.2, phi: 0.3 }
    const tMax = 20
    const dt = 0.05
    const trajectory = integrateGuidingCenter(initial, 0, { dt, tMax })
    const final = trajectory.at(-1)

    expect(final).toBeDefined()
    if (!final) return

    const expectedPhi = initial.phi + (initial.r ** (-1.5) - 1) * tMax

    expect(Math.abs(final.r - initial.r)).toBeLessThan(1e-14)
    expect(Math.abs(final.phi - expectedPhi)).toBeLessThan(1e-12)
    expect(final.t).toBe(tMax)
  })

  it('shortens the final step to land exactly on tMax', () => {
    const trajectory = integrateGuidingCenter({ r: 1.1, phi: 0.4 }, 0, {
      dt: 0.3,
      tMax: 1,
    })

    expect(trajectory.map((point) => point.t)).toEqual([0, 0.3, 0.6, 0.8999999999999999, 1])
  })

  it('keeps the reduced Hamiltonian nearly constant for a representative perturbed orbit', () => {
    const mu = 0.001
    const trajectory = integrateGuidingCenter(
      { r: 1.05, phi: 0.5 },
      mu,
      { dt: 0.05, tMax: 200 },
    )

    expect(maxHamiltonianError(trajectory, mu)).toBeLessThan(1e-10)
  })

  it('rejects invalid integration settings', () => {
    expect(() =>
      integrateGuidingCenter({ r: 1, phi: 0 }, 0.001, { dt: 0, tMax: 1 }),
    ).toThrow(/dt must be positive/)

    expect(() =>
      integrateGuidingCenter({ r: 1, phi: 0 }, 0.001, { dt: 0.1, tMax: -1 }),
    ).toThrow(/tMax must be non-negative/)

    expect(() =>
      integrateGuidingCenter(
        { r: 1, phi: 0 },
        0.001,
        { dt: 0.01, tMax: 1, maxSteps: 10 },
      ),
    ).toThrow(/exceeding maxSteps/)
  })

  it('rejects an RK4 step that is not forward in time', () => {
    expect(() => rk4Step({ r: 1, phi: 0 }, 0.001, 0)).toThrow(/dt must be positive/)
  })
})
