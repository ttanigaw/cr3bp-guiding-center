import { trajectoryDiagnosticData } from '../diagnostics/diagnosticData'
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
  const diagnosticData = trajectoryDiagnosticData(trajectory, mu)

  let maxHamiltonianDrift = 0
  let minSecondaryDistance = Number.POSITIVE_INFINITY

  for (const point of diagnosticData) {
    maxHamiltonianDrift = Math.max(maxHamiltonianDrift, point.absDeltaHGc)
    minSecondaryDistance = Math.min(minSecondaryDistance, point.r2)
  }

  return { maxHamiltonianDrift, minSecondaryDistance }
}
