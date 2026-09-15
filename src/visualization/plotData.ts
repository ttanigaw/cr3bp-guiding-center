import { wrapPhiDegrees, wrapPhiRadians } from '../math/angles'
import type { TrajectoryPoint } from '../physics/integrator'

export { wrapPhiDegrees, wrapPhiRadians }

export interface WrappedPlotPoint {
  t: number
  phiDegrees: number
  rOffset: number
}

export function wrappedPlotSegments(trajectory: TrajectoryPoint[]): WrappedPlotPoint[][] {
  if (trajectory.length === 0) return []

  const segments: WrappedPlotPoint[][] = []
  let currentSegment: WrappedPlotPoint[] = []
  let previousPhiDegrees: number | null = null

  for (const point of trajectory) {
    const phiDegrees = wrapPhiDegrees(point.phi)
    const plotPoint = { t: point.t, phiDegrees, rOffset: point.r - 1 }

    if (previousPhiDegrees !== null && Math.abs(phiDegrees - previousPhiDegrees) > 180) {
      if (currentSegment.length > 0) segments.push(currentSegment)
      currentSegment = []
    }

    currentSegment.push(plotPoint)
    previousPhiDegrees = phiDegrees
  }

  if (currentSegment.length > 0) segments.push(currentSegment)
  return segments
}

export function sampleTrajectory(trajectory: TrajectoryPoint[], maxPoints = 1800): TrajectoryPoint[] {
  if (trajectory.length <= maxPoints) return trajectory
  const stride = Math.ceil(trajectory.length / maxPoints)
  const sampled = trajectory.filter((_, index) => index % stride === 0)
  const finalPoint = trajectory[trajectory.length - 1]
  if (sampled[sampled.length - 1] !== finalPoint) sampled.push(finalPoint)
  return sampled
}
