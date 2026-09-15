import { describe, expect, it } from 'vitest'
import {
  diagnosticSample,
  trajectoryDiagnosticData,
} from '../src/diagnostics/diagnosticData'
import {
  bodyDistances,
  guidingCenterRates,
  reducedHamiltonian,
  tidalParameter,
} from '../src/physics/guidingCenter'
import { trajectoryDiagnostics } from '../src/physics/diagnostics'
import type { TrajectoryPoint } from '../src/physics/integrator'

function expectClose(actual: number, expected: number, tolerance = 1e-12): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
}

describe('diagnostic data layer', () => {
  it('derives one sample from the authoritative reduced-model physics helpers', () => {
    const mu = 0.001
    const initial: TrajectoryPoint = { t: 0, r: 1.02, phi: 0.8 }
    const point: TrajectoryPoint = { t: 3.4, r: 0.99, phi: 1.2 }
    const initialHamiltonian = reducedHamiltonian(initial, mu)
    const sample = diagnosticSample(point, mu, initialHamiltonian)
    const { r2 } = bodyDistances(point.r, point.phi, mu)
    const rates = guidingCenterRates(point, mu)
    const hGc = reducedHamiltonian(point, mu)

    expect(sample.t).toBe(point.t)
    expectClose(sample.binaryPeriods, point.t / (2 * Math.PI))
    expect(sample.r).toBe(point.r)
    expectClose(sample.rOffset, point.r - 1)
    expect(sample.phi).toBe(point.phi)
    expectClose(sample.phiDegreesWrapped, (point.phi * 180) / Math.PI)
    expectClose(sample.r2, r2)
    expectClose(sample.epsilonTide, tidalParameter(point, mu))
    expectClose(sample.hGc, hGc)
    expectClose(sample.deltaHGc, hGc - initialHamiltonian)
    expectClose(sample.absDeltaHGc, Math.abs(hGc - initialHamiltonian))
    expectClose(sample.rDot, rates.drdt)
    expectClose(sample.phiDot, rates.dphidt)
    expectClose(sample.absRadialRate, Math.abs(rates.drdt / point.r))
  })

  it('sets Delta H_gc to zero at the first trajectory sample', () => {
    const trajectory: TrajectoryPoint[] = [
      { t: 0, r: 1.01, phi: 2.9 },
      { t: 0.05, r: 1.009, phi: 2.91 },
    ]
    const data = trajectoryDiagnosticData(trajectory, 0.001)

    expect(data[0].deltaHGc).toBe(0)
    expect(data[0].absDeltaHGc).toBe(0)
  })

  it('uses the documented epsilon_tide = mu / r2^3 definition', () => {
    const mu = 0.002
    const point: TrajectoryPoint = { t: 1, r: 1.04, phi: 0.7 }
    const sample = diagnosticSample(point, mu, reducedHamiltonian(point, mu))
    const { r2 } = bodyDistances(point.r, point.phi, mu)

    expectClose(sample.epsilonTide, mu / r2 ** 3)
  })

  it('wraps display phi to -180 < phi <= 180 degrees without changing raw phi', () => {
    const point: TrajectoryPoint = { t: 0, r: 1, phi: (190 * Math.PI) / 180 }
    const sample = diagnosticSample(point, 0.001, reducedHamiltonian(point, 0.001))

    expect(sample.phi).toBe(point.phi)
    expectClose(sample.phiDegreesWrapped, -170)
  })

  it('preserves the existing whole-trajectory summary definitions', () => {
    const mu = 0.001
    const trajectory: TrajectoryPoint[] = [
      { t: 0, r: 1.02, phi: 2.7 },
      { t: 0.05, r: 1.019, phi: 2.69 },
      { t: 0.1, r: 1.018, phi: 2.68 },
    ]
    const data = trajectoryDiagnosticData(trajectory, mu)
    const summary = trajectoryDiagnostics(trajectory, mu)

    expectClose(summary.maxHamiltonianDrift, Math.max(...data.map((point) => point.absDeltaHGc)))
    expectClose(summary.minSecondaryDistance, Math.min(...data.map((point) => point.r2)))
  })

  it('rejects an empty trajectory', () => {
    expect(() => trajectoryDiagnosticData([], 0.001)).toThrow(/trajectory must contain at least one point/)
    expect(() => trajectoryDiagnostics([], 0.001)).toThrow(/trajectory must contain at least one point/)
  })
})
