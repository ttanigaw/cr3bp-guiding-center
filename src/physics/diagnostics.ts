import { bodyDistances, reducedHamiltonian } from './guidingCenter'
import type { TrajectoryPoint } from './integrator'

export interface TrajectoryDiagnostics {
  maxHamiltonianDrift: number
  minSecondaryDistance: number
}

/**
 * Compute diagnostics from an already integrated trajectory without modifying
 * the numerical solution.
 */
export function trajectoryDiagnostics(
  trajectory: readonly TrajectoryPoint[],
  mu: number,
): TrajectoryDiagnostics {
  if (trajectory.length === 0) {
    throw new RangeError('trajectory must contain at least one point')
  }

  const initialHamiltonian = reducedHamiltonian(trajectory[0], mu)
  let maxHamiltonianDrift = 0
  let minSecondaryDistance = Number.POSITIVE_INFINITY

  for (const point of trajectory) {
    const drift = Math.abs(reducedHamiltonian(point, mu) - initialHamiltonian)
    maxHamiltonianDrift = Math.max(maxHamiltonianDrift, drift)

    const { r2 } = bodyDistances(point.r, point.phi, mu)
    minSecondaryDistance = Math.min(minSecondaryDistance, r2)
  }

  return { maxHamiltonianDrift, minSecondaryDistance }
}
