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
const AXIS_LIMIT = 1.22
const AXIS_LABEL_OFFSET = 1.28
const BINARY_PERIOD = 2 * Math.PI
const AFTERIMAGE_OFFSETS = [BINARY_PERIOD / 12, BINARY_PERIOD / 6, BINARY_PERIOD / 4]
const FADE_TRAIL_DURATION = BINARY_PERIOD / 3
const FADE_TRAIL_MAX_OPACITY = 0.52

function toSvgCoordinates(point: { x: number; y: number }): [number, number] {
  return [point.x, -point.y]
}

export default function InertialTrajectoryPlot({
  trajectory,
  mu,
  currentTime,
}: InertialTrajectoryPlotProps) {
  const current = trajectoryPointAtTime(trajectory, currentTime)
  const currentCartesian = inertialCartesian(current)
  const bodies = inertialBodyPositions(mu, current.t)
  const lagrange = inertialLagrangePositions(mu, current.t)
  const [currentX, currentY] = toSvgCoordinates(currentCartesian)
  const [primaryX, primaryY] = toSvgCoordinates(bodies.primary)
  const [secondaryX, secondaryY] = toSvgCoordinates(bodies.secondary)
  const [l4X, l4Y] = toSvgCoordinates(lagrange.l4)
  const [l5X, l5Y] = toSvgCoordinates(lagrange.l5)

  const afterimages = AFTERIMAGE_OFFSETS.flatMap((offset, index) => {
    const pastTime = current.t - offset
    if (pastTime < trajectory[0].t) {
      return []
    }

    const point = trajectoryPointAtTime(trajectory, pastTime)
    const [x, y] = toSvgCoordinates(inertialCartesian(point))
    return [{ index: index + 1, x, y }]
  })

  const trail = trajectoryTrailAtTime(trajectory, current.t, FADE_TRAIL_DURATION)
  const trailSegments = trail.slice(1).map((point, index) => {
    const previous = trail[index]
    const previousCartesian = toSvgCoordinates(inertialCartesian(previous))
    const currentCartesianPoint = toSvgCoordinates(inertialCartesian(point))
    const segmentMidpointTime = (previous.t + point.t) / 2
    const age = current.t - segmentMidpointTime
    const fadeFraction = Math.max(0, 1 - age / FADE_TRAIL_DURATION)

    return {
      index,
      x1: previousCartesian[0],
      y1: previousCartesian[1],
      x2: currentCartesianPoint[0],
      y2: currentCartesianPoint[1],
      opacity: FADE_TRAIL_MAX_OPACITY * fadeFraction,
    }
  })

  return (
    <figure className="trajectory-card" aria-labelledby="inertial-trajectory-title">
      <div className="plot-heading">
        <div>
          <p className="eyebrow">Inertial frame</p>
          <h2 id="inertial-trajectory-title">Guiding-center trajectory</h2>
        </div>
        <p className="plot-note">θ = φ + t · 3 afterimages + fading 4/12-period trail</p>
      </div>

      <svg
        className="trajectory-plot"
        viewBox={`${-VIEW_LIMIT} ${-VIEW_LIMIT} ${2 * VIEW_LIMIT} ${2 * VIEW_LIMIT}`}
        role="img"
        aria-labelledby="inertial-svg-title inertial-svg-description"
      >
        <title id="inertial-svg-title">Animated inertial-frame guiding-center trajectory</title>
        <desc id="inertial-svg-description">
          Current reduced guiding-center position with three discrete past-position afterimages and a
          thin fading trail extending four twelfths of a binary period into the past. The primary,
          secondary, L4, and L5 rotate with the same animation time. Positive inertial X and Y
          directions are marked with arrows.
        </desc>

        <defs>
          <marker id="inertial-axis-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 6 3 L 0 6 z" className="axis-arrowhead" />
          </marker>
        </defs>

        <circle className="reference-orbit" cx="0" cy="0" r="1" />

        <line className="axis" x1={-AXIS_LIMIT} x2={AXIS_LIMIT} y1="0" y2="0" />
        <line className="axis" x1="0" x2="0" y1={-AXIS_LIMIT} y2={AXIS_LIMIT} />
        <line className="positive-axis" x1="0" y1="0" x2={AXIS_LIMIT} y2="0" markerEnd="url(#inertial-axis-arrow)" />
        <line className="positive-axis" x1="0" y1="0" x2="0" y2={-AXIS_LIMIT} markerEnd="url(#inertial-axis-arrow)" />
        <text className="axis-label" x={AXIS_LABEL_OFFSET} y="0">+X</text>
        <text className="axis-label" x="0" y={-AXIS_LABEL_OFFSET}>+Y</text>

        <polyline className="lagrange-geometry" points={`${primaryX},${primaryY} ${l4X},${l4Y} ${secondaryX},${secondaryY} ${primaryX},${primaryY}`} />
        <polyline className="lagrange-geometry" points={`${primaryX},${primaryY} ${l5X},${l5Y} ${secondaryX},${secondaryY} ${primaryX},${primaryY}`} />

        <circle className="lagrange-point" cx={l4X} cy={l4Y} r="0.018" />
        <circle className="lagrange-point" cx={l5X} cy={l5Y} r="0.018" />

        {trailSegments.map((segment) => (
          <line
            key={segment.index}
            className="afterimage-trail-segment"
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            strokeOpacity={segment.opacity}
          />
        ))}

        {afterimages.map((afterimage) => (
          <circle
            key={afterimage.index}
            className={`afterimage afterimage-${afterimage.index}`}
            cx={afterimage.x}
            cy={afterimage.y}
            r="0.024"
          />
        ))}
        <circle className="current-position" cx={currentX} cy={currentY} r="0.028" />

        <circle className="primary-body" cx={primaryX} cy={primaryY} r="0.055" />
        <circle className="secondary-body" cx={secondaryX} cy={secondaryY} r="0.036" />
      </svg>

      <div className="plot-legend" aria-label="Inertial plot legend">
        <span><i className="legend-swatch trail-swatch" />Fading trail</span>
        <span><i className="legend-swatch current-swatch" />Current position</span>
        <span><i className="legend-swatch afterimage-swatch afterimage-swatch-1" />−1/12 period</span>
        <span><i className="legend-swatch afterimage-swatch afterimage-swatch-2" />−2/12 period</span>
        <span><i className="legend-swatch afterimage-swatch afterimage-swatch-3" />−3/12 period</span>
        <span><i className="legend-swatch primary-swatch" />Primary</span>
        <span><i className="legend-swatch secondary-swatch" />Secondary</span>
        <span><i className="legend-swatch lagrange-swatch" />L4 / L5</span>
      </div>
    </figure>
  )
}
