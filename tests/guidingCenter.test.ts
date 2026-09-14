import { describe, expect, it } from 'vitest'
import {
  bodyDistances,
  disturbingFunction,
  disturbingFunctionDerivatives,
  guidingCenterRates,
  reducedHamiltonian,
  tidalParameter,
} from '../src/physics/guidingCenter'

function expectClose(actual: number, expected: number, absoluteTolerance = 1e-9): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(absoluteTolerance)
}

describe('guiding-center physics', () => {
  it('evaluates analytic disturbing-function derivatives consistently with finite differences', () => {
    const r = 1.07
    const phi = 1.1
    const mu = 0.001
    const h = 1e-5

    const finiteDifferenceR =
      (disturbingFunction(r + h, phi, mu) - disturbingFunction(r - h, phi, mu)) /
      (2 * h)
    const finiteDifferencePhi =
      (disturbingFunction(r, phi + h, mu) - disturbingFunction(r, phi - h, mu)) /
      (2 * h)

    const { dRdr, dRdPhi } = disturbingFunctionDerivatives(r, phi, mu)

    expectClose(dRdr, finiteDifferenceR)
    expectClose(dRdPhi, finiteDifferencePhi)
  })

  it('recovers the unperturbed Keplerian limit when mu = 0', () => {
    const state = { r: 1.2, phi: 0.4 }
    const { dRdr, dRdPhi } = disturbingFunctionDerivatives(state.r, state.phi, 0)
    const rates = guidingCenterRates(state, 0)

    expectClose(disturbingFunction(state.r, state.phi, 0), 0, 1e-15)
    expectClose(dRdr, 0, 1e-15)
    expect(dRdPhi).toBe(0)
    expect(rates.drdt).toBe(0)
    expectClose(rates.dphidt, state.r ** (-1.5) - 1, 1e-15)
    expectClose(
      reducedHamiltonian(state, 0),
      -1 / (2 * state.r) - Math.sqrt(state.r),
      1e-15,
    )
    expect(tidalParameter(state, 0)).toBe(0)
  })

  it('has the expected reflection symmetry in phi', () => {
    const r = 0.98
    const phi = 0.9
    const mu = 0.001

    const positive = disturbingFunctionDerivatives(r, phi, mu)
    const negative = disturbingFunctionDerivatives(r, -phi, mu)
    const positiveRates = guidingCenterRates({ r, phi }, mu)
    const negativeRates = guidingCenterRates({ r, phi: -phi }, mu)

    expectClose(disturbingFunction(r, phi, mu), disturbingFunction(r, -phi, mu), 1e-15)
    expectClose(positive.dRdr, negative.dRdr, 1e-15)
    expectClose(positive.dRdPhi, -negative.dRdPhi, 1e-15)
    expectClose(positiveRates.drdt, -negativeRates.drdt, 1e-15)
    expectClose(positiveRates.dphidt, negativeRates.dphidt, 1e-15)
  })

  it('returns the standard barycentric distances to the two massive bodies', () => {
    const r = 1
    const phi = Math.PI / 2
    const mu = 0.001
    const { r1, r2 } = bodyDistances(r, phi, mu)

    expectClose(r1, Math.sqrt(1 + mu ** 2), 1e-15)
    expectClose(r2, Math.sqrt(1 + (1 - mu) ** 2), 1e-15)
  })

  it('rejects states outside the documented radial and mass-ratio domain', () => {
    expect(() => disturbingFunction(0, 0, 0.001)).toThrow(/r must be positive/)
    expect(() => disturbingFunction(1, 0, -0.001)).toThrow(/0 <= mu <= 0.5/)
    expect(() => disturbingFunction(1, 0, 0.6)).toThrow(/0 <= mu <= 0.5/)
    expect(() => disturbingFunction(1, Number.NaN, 0.001)).toThrow(/phi must be finite/)
  })
})
