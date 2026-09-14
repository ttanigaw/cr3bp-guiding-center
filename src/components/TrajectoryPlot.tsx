import type { TrajectoryPoint } from '../physics/integrator'
import { rotatingCartesian } from '../visualization/frames'

interface TrajectoryPlotProps {
  trajectory: TrajectoryPoint[]
  mu: number
  currentPoint: TrajectoryPoint
}

const VIEW_LIMIT = 1.35
const MAX_PATH_POINTS = 1200

function toSvgCoordinates(point: Pick<TrajectoryPoint, 'r' | 'phi'>): [number, number] {
  const cartesian = rotatingCartesian(point)
  return [cartesian.x, -cartesian.y]
}

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

function trajectoryPath(trajectory: TrajectoryPoint[]): string {
  return sampledPoints(trajectory)
    .map((point, index) => {
      const [x, y] = toSvgCoordinates(point)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(6)} ${y.toFixed(6)}`
    })
    .join(' ')
}

export default function TrajectoryPlot({
  trajectory,
  mu,
  currentPoint,
}: TrajectoryPlotProps) {
  const path = trajectoryPath(trajectory)
  const [currentX, currentY] = toSvgCoordinates(currentPoint)
  const primaryX = -mu
  const secondaryX = 1 - mu
  const lagrangeX = 0.5 - mu
  const lagrangeY = Math.sqrt(3) / 2

  return (
    <figure className="trajectory-card" aria-labelledby="trajectory-title">
      <div className="plot-heading">
        <div>
          <p className="eyebrow">Rotating frame</p>
          <h2 id="trajectory-title">Guiding-center trajectory</h2>
        </div>
        <p className="plot-note">Equal-axis view · corotation radius = 1</p>
      </div>

      <svg
        className="trajectory-plot"
        viewBox={`${-VIEW_LIMIT} ${-VIEW_LIMIT} ${2 * VIEW_LIMIT} ${2 * VIEW_LIMIT}`}
        role="img"
        aria-labelledby="trajectory-svg-title trajectory-svg-description"
      >
        <title id="trajectory-svg-title">Rotating-frame co-orbital trajectory</title>
        <desc id="trajectory-svg-description">
          Full reduced trajectory with a moving current-position marker, fixed primary and secondary,
          corotation circle, and L4 and L5 markers.
        </desc>

        <line className="axis" x1={-VIEW_LIMIT} x2={VIEW_LIMIT} y1="0" y2="0" />
        <line className="axis" x1="0" x2="0" y1={-VIEW_LIMIT} y2={VIEW_LIMIT} />
        <circle className="corotation" cx="0" cy="0" r="1" />

        <circle className="lagrange-point" cx={lagrangeX} cy={-lagrangeY} r="0.018" />
        <circle className="lagrange-point" cx={lagrangeX} cy={lagrangeY} r="0.018" />

        <path className="trajectory-path" d={path} />
        <circle className="current-position" cx={currentX} cy={currentY} r="0.028" />

        <circle className="primary-body" cx={primaryX} cy="0" r="0.055" />
        <circle className="secondary-body" cx={secondaryX} cy="0" r="0.036" />
      </svg>

      <div className="plot-legend" aria-label="Plot legend">
        <span><i className="legend-swatch trajectory-swatch" />Trajectory</span>
        <span><i className="legend-swatch current-swatch" />Current position</span>
        <span><i className="legend-swatch primary-swatch" />Primary</span>
        <span><i className="legend-swatch secondary-swatch" />Secondary</span>
        <span><i className="legend-swatch lagrange-swatch" />L4 / L5</span>
      </div>
    </figure>
  )
}
