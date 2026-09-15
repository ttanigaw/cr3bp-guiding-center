import type { TrajectoryPoint } from '../physics/integrator'
import { inertialAxesInRotatingFrame, rotatingCartesian } from '../visualization/frames'
import { trajectoryPointAtTime } from '../visualization/playback'

interface TrajectoryPlotProps {
  trajectory: TrajectoryPoint[]
  mu: number
  currentPoint: TrajectoryPoint
  currentTime: number
  showAfterimages: boolean
  showLagrangePoints: boolean
  showLagrangeTriangles: boolean
  showTrajectory: boolean
  showAxes: boolean
  onToggleTrajectory: () => void
  onToggleAxes: () => void
}

const VIEW_LIMIT = 1.35
const AXIS_LIMIT = 1.22
const AXIS_LABEL_RADIUS = 1.28
const MAX_PATH_POINTS = 1200
const BINARY_PERIOD = 2 * Math.PI
const AFTERIMAGE_OFFSETS = [BINARY_PERIOD / 12, BINARY_PERIOD / 6, BINARY_PERIOD / 4]

function toSvgCoordinates(point: Pick<TrajectoryPoint, 'r' | 'phi'>): [number, number] {
  const cartesian = rotatingCartesian(point)
  return [cartesian.x, -cartesian.y]
}

function cartesianToSvg(point: { x: number; y: number }): [number, number] {
  return [point.x, -point.y]
}

function sampledPoints(trajectory: TrajectoryPoint[]): TrajectoryPoint[] {
  if (trajectory.length <= MAX_PATH_POINTS) return trajectory
  const stride = Math.ceil(trajectory.length / MAX_PATH_POINTS)
  const sampled = trajectory.filter((_, index) => index % stride === 0)
  const finalPoint = trajectory[trajectory.length - 1]
  if (sampled[sampled.length - 1] !== finalPoint) sampled.push(finalPoint)
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

function PanelToggle({ label, pressed, onClick }: { label: string; pressed: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`toggle-button${pressed ? ' active' : ''}`} aria-pressed={pressed} onClick={onClick}>
      {label}
    </button>
  )
}

export default function TrajectoryPlot({
  trajectory,
  mu,
  currentPoint,
  currentTime,
  showAfterimages,
  showLagrangePoints,
  showLagrangeTriangles,
  showTrajectory,
  showAxes,
  onToggleTrajectory,
  onToggleAxes,
}: TrajectoryPlotProps) {
  const path = trajectoryPath(trajectory)
  const [currentX, currentY] = toSvgCoordinates(currentPoint)
  const primary = { x: -mu, y: 0 }
  const secondary = { x: 1 - mu, y: 0 }
  const lagrangeX = 0.5 - mu
  const lagrangeY = Math.sqrt(3) / 2
  const l4 = { x: lagrangeX, y: lagrangeY }
  const l5 = { x: lagrangeX, y: -lagrangeY }
  const axes = inertialAxesInRotatingFrame(currentTime)

  const afterimages = AFTERIMAGE_OFFSETS.flatMap((offset, index) => {
    const pastTime = currentTime - offset
    if (pastTime < trajectory[0].t) return []
    const point = trajectoryPointAtTime(trajectory, pastTime)
    const [x, y] = toSvgCoordinates(point)
    return [{ index: index + 1, x, y }]
  })

  const axisLine = (direction: { x: number; y: number }) => {
    const start = cartesianToSvg({ x: -AXIS_LIMIT * direction.x, y: -AXIS_LIMIT * direction.y })
    const end = cartesianToSvg({ x: AXIS_LIMIT * direction.x, y: AXIS_LIMIT * direction.y })
    return { start, end }
  }

  const xAxis = axisLine(axes.xPositive)
  const yAxis = axisLine(axes.yPositive)
  const xLabel = cartesianToSvg({ x: AXIS_LABEL_RADIUS * axes.xPositive.x, y: AXIS_LABEL_RADIUS * axes.xPositive.y })
  const yLabel = cartesianToSvg({ x: AXIS_LABEL_RADIUS * axes.yPositive.x, y: AXIS_LABEL_RADIUS * axes.yPositive.y })

  const [primaryX, primaryY] = cartesianToSvg(primary)
  const [secondaryX, secondaryY] = cartesianToSvg(secondary)
  const [l4X, l4Y] = cartesianToSvg(l4)
  const [l5X, l5Y] = cartesianToSvg(l5)

  return (
    <figure className="trajectory-card" aria-labelledby="trajectory-title">
      <div className="plot-heading panel-heading-with-options">
        <div>
          <p className="eyebrow">Rotating frame</p>
          <h2 id="trajectory-title">Guiding-center trajectory</h2>
          <p className="plot-note">Inertial X/Y axes rotate clockwise in this view</p>
        </div>
        <div className="panel-option-buttons" role="group" aria-label="Rotating frame display options">
          <PanelToggle label="Trajectory" pressed={showTrajectory} onClick={onToggleTrajectory} />
          <PanelToggle label="Axes" pressed={showAxes} onClick={onToggleAxes} />
        </div>
      </div>

      <svg className="trajectory-plot" viewBox={`${-VIEW_LIMIT} ${-VIEW_LIMIT} ${2 * VIEW_LIMIT} ${2 * VIEW_LIMIT}`} role="img" aria-labelledby="trajectory-svg-title trajectory-svg-description">
        <title id="trajectory-svg-title">Rotating-frame co-orbital trajectory</title>
        <desc id="trajectory-svg-description">Reduced trajectory with optional trajectory, afterimages, L4/L5 geometry, and inertial coordinate axes.</desc>

        <defs>
          <marker id="rotating-axis-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 6 3 L 0 6 z" className="axis-arrowhead" />
          </marker>
        </defs>

        <circle className="corotation" cx="0" cy="0" r="1" />

        {showAxes && <>
          <line className="axis inertial-axis" x1={xAxis.start[0]} y1={xAxis.start[1]} x2={xAxis.end[0]} y2={xAxis.end[1]} markerEnd="url(#rotating-axis-arrow)" />
          <line className="axis inertial-axis" x1={yAxis.start[0]} y1={yAxis.start[1]} x2={yAxis.end[0]} y2={yAxis.end[1]} markerEnd="url(#rotating-axis-arrow)" />
          <text className="axis-label" x={xLabel[0]} y={xLabel[1]}>+X</text>
          <text className="axis-label" x={yLabel[0]} y={yLabel[1]}>+Y</text>
        </>}

        {showLagrangeTriangles && <>
          <polyline className="lagrange-geometry" points={`${primaryX},${primaryY} ${l4X},${l4Y} ${secondaryX},${secondaryY} ${primaryX},${primaryY}`} />
          <polyline className="lagrange-geometry" points={`${primaryX},${primaryY} ${l5X},${l5Y} ${secondaryX},${secondaryY} ${primaryX},${primaryY}`} />
        </>}

        {showLagrangePoints && <>
          <circle className="lagrange-point" cx={l4X} cy={l4Y} r="0.018" />
          <circle className="lagrange-point" cx={l5X} cy={l5Y} r="0.018" />
        </>}

        {showTrajectory && <path className="trajectory-path" d={path} />}
        {showAfterimages && afterimages.map((afterimage) => (
          <circle key={afterimage.index} className={`afterimage afterimage-${afterimage.index}`} cx={afterimage.x} cy={afterimage.y} r="0.024" />
        ))}
        <circle className="current-position" cx={currentX} cy={currentY} r="0.028" />
        <circle className="primary-body" cx={primaryX} cy={primaryY} r="0.055" />
        <circle className="secondary-body" cx={secondaryX} cy={secondaryY} r="0.036" />
      </svg>

      <div className="plot-legend" aria-label="Plot legend">
        <span><i className="legend-swatch primary-swatch" />Primary</span>
        <span><i className="legend-swatch secondary-swatch" />Secondary</span>
        <span><i className="legend-swatch current-swatch" />Current position</span>
        {showAfterimages && <>
          <span><i className="legend-swatch afterimage-swatch afterimage-swatch-1" />−1/12 period</span>
          <span><i className="legend-swatch afterimage-swatch afterimage-swatch-2" />−2/12 period</span>
          <span><i className="legend-swatch afterimage-swatch afterimage-swatch-3" />−3/12 period</span>
        </>}
        {showTrajectory && <span><i className="legend-swatch trajectory-swatch" />Trajectory</span>}
        {showLagrangePoints && <span><i className="legend-swatch lagrange-swatch" />L4 / L5</span>}
      </div>
    </figure>
  )
}
