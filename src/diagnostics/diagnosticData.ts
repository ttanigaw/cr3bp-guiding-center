import { wrapPhiDegrees } from '../math/angles'
import {
  bodyDistances,
  guidingCenterRates,
  reducedHamiltonian,
  tidalParameter,
} from '../physics/guidingCenter'
import type { TrajectoryPoint } from '../physics/integrator'

export interface DiagnosticSample {
  t: number
  binaryPeriods: number
  r: number
  rOffset: number
  phi: number
  phiDegreesWrapped: number
  r2: number
  epsilonTide: number
  hGc: number
  deltaHGc: number
  absDeltaHGc: number
  rDot: number
  phiDot: number
  absRadialRate: number
}

export function diagnosticSample(
  point: TrajectoryPoint,
  mu: number,
  initialHamiltonian: number,
): DiagnosticSample {
  const { r2 } = bodyDistances(point.r, point.phi, mu)
  const hGc = reducedHamiltonian(point, mu)
  const deltaHGc = hGc - initialHamiltonian
  const { drdt, dphidt } = guidingCenterRates(point, mu)

  return {
    t: point.t,
    binaryPeriods: point.t / (2 * Math.PI),
    r: point.r,
    rOffset: point.r - 1,
    phi: point.phi,
    phiDegreesWrapped: wrapPhiDegrees(point.phi),
    r2,
    epsilonTide: tidalParameter(point, mu),
    hGc,
    deltaHGc,
    absDeltaHGc: Math.abs(deltaHGc),
    rDot: drdt,
    phiDot: dphidt,
    absRadialRate: Math.abs(drdt / point.r),
  }
}

export function trajectoryDiagnosticData(
  trajectory: readonly TrajectoryPoint[],
  mu: number,
): DiagnosticSample[] {
  if (trajectory.length === 0) {
    throw new RangeError('trajectory must contain at least one point')
  }

  const initialHamiltonian = reducedHamiltonian(trajectory[0], mu)
  return trajectory.map((point) => diagnosticSample(point, mu, initialHamiltonian))
}
