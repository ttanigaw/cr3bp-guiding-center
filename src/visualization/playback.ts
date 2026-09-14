import type { TrajectoryPoint } from '../physics/integrator'

function validateTrajectory(trajectory: readonly TrajectoryPoint[]): void {
  if (trajectory.length === 0) {
    throw new RangeError('trajectory must contain at least one point')
  }
}

function validateFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be finite`)
  }
}

/**
 * Return a display state at an arbitrary animation time.
 *
 * The numerical trajectory is never modified. Between stored RK4 output
 * samples, r and phi are linearly interpolated for rendering only.
 */
export function trajectoryPointAtTime(
  trajectory: readonly TrajectoryPoint[],
  time: number,
): TrajectoryPoint {
  validateTrajectory(trajectory)
  validateFinite(time, 'time')

  const first = trajectory[0]
  const last = trajectory[trajectory.length - 1]

  if (time <= first.t) {
    return first
  }
  if (time >= last.t) {
    return last
  }

  let low = 0
  let high = trajectory.length - 1

  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2)
    if (trajectory[middle].t < time) {
      low = middle
    } else {
      high = middle
    }
  }

  const left = trajectory[low]
  const right = trajectory[high]

  if (right.t === time) {
    return right
  }

  const fraction = (time - left.t) / (right.t - left.t)

  return {
    t: time,
    r: left.r + fraction * (right.r - left.r),
    phi: left.phi + fraction * (right.phi - left.phi),
  }
}

/**
 * Select a recent trajectory segment ending at the requested animation time.
 * Boundary points are interpolated for display only.
 */
export function trajectoryTrailAtTime(
  trajectory: readonly TrajectoryPoint[],
  time: number,
  duration: number,
): TrajectoryPoint[] {
  validateTrajectory(trajectory)
  validateFinite(time, 'time')
  validateFinite(duration, 'duration')

  if (duration < 0) {
    throw new RangeError('duration must be non-negative')
  }

  const firstTime = trajectory[0].t
  const current = trajectoryPointAtTime(trajectory, time)
  const startTime = Math.max(firstTime, current.t - duration)

  if (startTime === current.t) {
    return [current]
  }

  const start = trajectoryPointAtTime(trajectory, startTime)
  const interior = trajectory.filter(
    (point) => point.t > start.t && point.t < current.t,
  )

  return [start, ...interior, current]
}
