import type { TrajectoryPoint } from '../physics/integrator'
import {
  inertialBodyPositions,
  inertialCartesian,
  inertialLagrangePositions,
} from '../visualization/frames'
import { trajectoryPointAtTime, trajectoryTrailAtTime } from '../visualization/playback'

interface InertialTrajectoryPlotProps {
  trajectory: TrajectoryPoint[]
  mu: number
  currentTime: number
}

const VIEW_LIMIT = 1.35
const MAX_PATH_POINTS = 1200
const TRAIL_DURATION = 4 * Math.PI

function sampledPoints(trajectory: TrajectoryPoint[]): TrajectoryPoint[] {
  if (trajectory.length <= MAX_PATH_POINTS) {
    return trajectory
  }

  const stride = Math.ceil(trajectory.length / MAX_PATH_POINTS)
  const sampled = trajectory.filter((_, index) => index % stride === 0)
  const finalPoint = trajectory[trajectory.length - 1]

  if (sampled[sampled.length - 1] !== finalPoint) {
    sampled.push(finalPoint)
  }

  return sampled
}

function toSvgCoordinates(point: { x: number; y: number }): [number, number] {
  return [point.x, -point.y]
}

function trajectoryPath(trajectory: TrajectoryPoint[]): string {
  return sampledPoints(trajectory)
    .map((point, index) => {
      const [x, y] = toSvgCoordinates(inertialCartesian(point))
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(6)} ${y.toFixed(6)}`
    })
    .join(' ')
}

export default function InertialTrajectoryPlot({
  trajectory,
  mu,
  currentTime,
}: InertialTrajectoryPlotProps) {
  const current = trajectoryPointAtTime(trajectory, currentTime)
  const trail = trajectoryTrailAtTime(trajectory, currentTime, TRAIL_DURATION)
  const path = trajectoryPath(trail)
  const currentCartesian = inertialCartesian(current)
  const bodies = inertialBodyPositions(mu, current.t)
  const lagrange = inertialLagrangePositions(mu, current.t)
  const [currentX, currentY] = toSvgCoordinates(currentCartesian)
  const [primaryX, primaryY] = toSvgCoordinates(bodies.primary)
  const [secondaryX, secondaryY] = toSvgCoordinates(bodies.secondary)
  const [l4X, l4Y] = toSvgCoordinates(lagrange.l4)
  const [l5X, l5Y] = toSvgCoordinates(lagrange.l5)

  return (
    <figure className="trajectory-card" aria-labelledby="inertial-trajectory-title">
      <div className="plot-heading">
        <div>
          <p className="eyebrow">Inertial frame</p>
          <h2 id="inertial-trajectory-title">Guiding-center trajectory</h2>
        </div>
        <p className="plot-note">θ = φ + t · recent trail = 2 binary periods</p>
      </div>

      <svg
        className="trajectory-plot"
        viewBox={`${-VIEW_LIMIT} ${-VIEW_LIMIT} ${2 * VIEW_LIMIT} ${2 * VIEW_LIMIT}`}
        role="img"
        aria-labelledby="inertial-svg-title inertial-svg-description"
      >
        <title id="inertial-svg-title">Animated inertial-frame guiding-center trajectory</title>
        <desc id="inertial-svg-description">
          Current reduced guiding-center position with a recent trail. The primary, secondary, L4,
          and L5 rotate with the same animation time.
        </desc>

        <line className="axis" x1={-VIEW_LIMIT} x2={VIEW_LIMIT} y1="0" y2="0" />
        <line className="axis" x1="0" x2="0" y1={-VIEW_LIMIT} y2={VIEW_LIMIT} />
        <circle className="reference-orbit" cx="0" cy="0" r="1" />

        <circle className="lagrange-point" cx={l4X} cy={l4Y} r="0.018" />
        <circle className="lagrange-point" cx={l5X} cy={l5Y} r="0.018" />

        <path className="trajectory-path inertial-trajectory-path" d={path} />
        <circle className="current-position" cx={currentX} cy={currentY} r="0.028" />

        <circle className="primary-body" cx={primaryX} cy={primaryY} r="0.055" />
        <circle className="secondary-body" cx={secondaryX} cy={secondaryY} r="0.036" />
      </svg>

      <div className="plot-legend" aria-label="Inertial plot legend">
        <span><i className="legend-swatch trajectory-swatch" />Recent trail</span>
        <span><i className="legend-swatch current-swatch" />Current position</span>
        <span><i className="legend-swatch primary-swatch" />Primary</span>
        <span><i className="legend-swatch secondary-swatch" />Secondary</span>
        <span><i className="legend-swatch lagrange-swatch" />L4 / L5</span>
      </div>
    </figure>
  )
}
