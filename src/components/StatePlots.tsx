import { useState, type ReactNode } from 'react'
import type { TrajectoryPoint } from '../physics/integrator'
import { sampleTrajectory, wrapPhiDegrees, wrappedPlotSegments } from '../visualization/plotData'

interface StatePlotsProps {
  trajectory: TrajectoryPoint[]
  currentPoint: TrajectoryPoint
}

interface Range {
  min: number
  max: number
}

interface PlotPath {
  key: string
  d: string
}

type PhaseSpaceScaleMode = 'auto' | 'equal'

const WIDTH = 640
const DEFAULT_HEIGHT = 260
const MARGIN = { left: 58, right: 18, top: 18, bottom: 42 }
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const DEFAULT_INNER_HEIGHT = DEFAULT_HEIGHT - MARGIN.top - MARGIN.bottom
const RAD_TO_DEG = 180 / Math.PI

function paddedRange(values: number[], includeValue: number, minimumSpan: number): Range {
  let min = Math.min(includeValue, ...values)
  let max = Math.max(includeValue, ...values)
  let span = max - min

  if (span < minimumSpan) {
    const center = (min + max) / 2
    min = center - minimumSpan / 2
    max = center + minimumSpan / 2
    span = minimumSpan
  }

  const padding = span * 0.08
  return { min: min - padding, max: max + padding }
}

function makeTicks(range: Range, count = 5): number[] {
  if (count <= 1) return [range.min]
  return Array.from({ length: count }, (_, index) => range.min + ((range.max - range.min) * index) / (count - 1))
}

function scaleX(value: number, range: Range): number {
  return MARGIN.left + ((value - range.min) / (range.max - range.min)) * INNER_WIDTH
}

function scaleY(value: number, range: Range, innerHeight: number): number {
  return MARGIN.top + (1 - (value - range.min) / (range.max - range.min)) * innerHeight
}

function pathFromPoints(
  points: Array<{ x: number; y: number }>,
  xRange: Range,
  yRange: Range,
  innerHeight = DEFAULT_INNER_HEIGHT,
): string {
  return points
    .map((point, index) => {
      const x = scaleX(point.x, xRange)
      const y = scaleY(point.y, yRange, innerHeight)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`
    })
    .join(' ')
}

function equalScaleInnerHeight(xRange: Range, yRange: Range): number {
  const xSpanDegrees = xRange.max - xRange.min
  const ySpanDegreesEquivalent = (yRange.max - yRange.min) * RAD_TO_DEG
  return INNER_WIDTH * (ySpanDegreesEquivalent / xSpanDegrees)
}

function PlotFrame({
  ariaLabel,
  paths,
  xRange,
  yRange,
  xLabel,
  yLabel,
  current,
  xTickFormat,
  yTickFormat,
  horizontalReference,
  className,
  height = DEFAULT_HEIGHT,
}: {
  ariaLabel: string
  paths: PlotPath[]
  xRange: Range
  yRange: Range
  xLabel: string
  yLabel: string
  current: { x: number; y: number }
  xTickFormat: (value: number) => string
  yTickFormat: (value: number) => string
  horizontalReference?: number
  className?: string
  height?: number
}) {
  const innerHeight = height - MARGIN.top - MARGIN.bottom
  const xTicks = makeTicks(xRange)
  const yTicks = makeTicks(yRange)

  return (
    <svg
      className={`state-plot${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      {xTicks.map((tick) => {
        const x = scaleX(tick, xRange)
        return (
          <g key={`x-${tick}`}>
            <line className="state-grid-line" x1={x} y1={MARGIN.top} x2={x} y2={MARGIN.top + innerHeight} />
            <text className="state-tick-label" x={x} y={height - 20} textAnchor="middle">{xTickFormat(tick)}</text>
          </g>
        )
      })}

      {yTicks.map((tick) => {
        const y = scaleY(tick, yRange, innerHeight)
        return (
          <g key={`y-${tick}`}>
            <line className="state-grid-line" x1={MARGIN.left} y1={y} x2={MARGIN.left + INNER_WIDTH} y2={y} />
            <text className="state-tick-label" x={MARGIN.left - 9} y={y + 4} textAnchor="end">{yTickFormat(tick)}</text>
          </g>
        )
      })}

      {horizontalReference !== undefined && horizontalReference >= yRange.min && horizontalReference <= yRange.max && (
        <line
          className="state-reference-line"
          x1={MARGIN.left}
          y1={scaleY(horizontalReference, yRange, innerHeight)}
          x2={MARGIN.left + INNER_WIDTH}
          y2={scaleY(horizontalReference, yRange, innerHeight)}
        />
      )}

      <line className="state-axis-line" x1={MARGIN.left} y1={MARGIN.top + innerHeight} x2={MARGIN.left + INNER_WIDTH} y2={MARGIN.top + innerHeight} />
      <line className="state-axis-line" x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + innerHeight} />

      {paths.map((path) => <path key={path.key} className="state-data-line" d={path.d} />)}

      <circle
        className="state-current-marker"
        cx={scaleX(current.x, xRange)}
        cy={scaleY(current.y, yRange, innerHeight)}
        r="5"
      />

      <text className="state-axis-title" x={MARGIN.left + INNER_WIDTH / 2} y={height - 3} textAnchor="middle">{xLabel}</text>
      <text
        className="state-axis-title"
        x="14"
        y={MARGIN.top + innerHeight / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${MARGIN.top + innerHeight / 2})`}
      >
        {yLabel}
      </text>
    </svg>
  )
}

function PlotCard({
  eyebrow,
  title,
  note,
  children,
  className,
  actions,
}: {
  eyebrow: string
  title: string
  note: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}) {
  return (
    <figure className={`state-plot-card${className ? ` ${className}` : ''}`}>
      <div className="state-plot-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="plot-note">{note}</p>
        </div>
        {actions}
      </div>
      {children}
    </figure>
  )
}

export default function StatePlots({ trajectory, currentPoint }: StatePlotsProps) {
  const [phaseSpaceScaleMode, setPhaseSpaceScaleMode] = useState<PhaseSpaceScaleMode>('auto')
  const sampled = sampleTrajectory(trajectory)
  const timeMax = Math.max(trajectory[trajectory.length - 1]?.t ?? 0, 1e-9)
  const timeRange = { min: 0, max: timeMax }

  const rRange = paddedRange(sampled.map((point) => point.r), 1, 0.02)
  const rPath = pathFromPoints(sampled.map((point) => ({ x: point.t, y: point.r })), timeRange, rRange)

  const wrappedSegments = wrappedPlotSegments(sampled)
  const phiRange = { min: -180, max: 180 }
  const phiPaths = wrappedSegments.map((segment, index) => ({
    key: `phi-${index}`,
    d: pathFromPoints(segment.map((point) => ({ x: point.t, y: point.phiDegrees })), timeRange, phiRange),
  }))

  const rOffsetRange = paddedRange(sampled.map((point) => point.r - 1), 0, 0.02)
  const phaseInnerHeight = phaseSpaceScaleMode === 'equal'
    ? equalScaleInnerHeight(phiRange, rOffsetRange)
    : DEFAULT_INNER_HEIGHT
  const phaseHeight = MARGIN.top + phaseInnerHeight + MARGIN.bottom
  const phasePaths = wrappedSegments.map((segment, index) => ({
    key: `phase-${index}`,
    d: pathFromPoints(
      segment.map((point) => ({ x: point.phiDegrees, y: point.rOffset })),
      phiRange,
      rOffsetRange,
      phaseInnerHeight,
    ),
  }))

  const currentPhiDegrees = wrapPhiDegrees(currentPoint.phi)
  const phaseNote = phaseSpaceScaleMode === 'equal'
    ? '1:1 scale uses (r − 1) × 180/π for vertical display scaling; dashed line marks corotation'
    : 'Auto-fit vertical scale; dashed line marks corotation'

  return (
    <section className="state-plot-grid" aria-label="Guiding-center state plots">
      <PlotCard eyebrow="Radial evolution" title="r(t)" note="Guiding-center radius; dashed line marks r = 1">
        <PlotFrame
          ariaLabel="Guiding-center radius versus nondimensional time"
          paths={[{ key: 'r', d: rPath }]}
          xRange={timeRange}
          yRange={rRange}
          xLabel="t"
          yLabel="r"
          current={{ x: currentPoint.t, y: currentPoint.r }}
          xTickFormat={(value) => value.toFixed(timeMax >= 100 ? 0 : timeMax >= 10 ? 1 : 2)}
          yTickFormat={(value) => value.toFixed(3)}
          horizontalReference={1}
          className="r-time-plot"
        />
      </PlotCard>

      <PlotCard eyebrow="Angular evolution" title="φ(t)" note="Wrapped to −180° < φ ≤ 180°; wrap jumps are not connected">
        <PlotFrame
          ariaLabel="Wrapped rotating-frame angle versus nondimensional time"
          paths={phiPaths}
          xRange={timeRange}
          yRange={phiRange}
          xLabel="t"
          yLabel="φ [deg]"
          current={{ x: currentPoint.t, y: currentPhiDegrees }}
          xTickFormat={(value) => value.toFixed(timeMax >= 100 ? 0 : timeMax >= 10 ? 1 : 2)}
          yTickFormat={(value) => value.toFixed(0)}
          horizontalReference={0}
          className="phi-time-plot"
        />
      </PlotCard>

      <PlotCard
        eyebrow="Reduced phase space"
        title="φ vs r − 1"
        note={phaseNote}
        className="phase-space-card"
        actions={(
          <div className="panel-option-buttons phase-scale-controls" role="group" aria-label="Phase-space vertical scale mode">
            <button
              type="button"
              className={`toggle-button${phaseSpaceScaleMode === 'auto' ? ' active' : ''}`}
              aria-pressed={phaseSpaceScaleMode === 'auto'}
              onClick={() => setPhaseSpaceScaleMode('auto')}
            >
              Auto fit
            </button>
            <button
              type="button"
              className={`toggle-button${phaseSpaceScaleMode === 'equal' ? ' active' : ''}`}
              aria-pressed={phaseSpaceScaleMode === 'equal'}
              onClick={() => setPhaseSpaceScaleMode('equal')}
            >
              1:1 scale
            </button>
          </div>
        )}
      >
        <PlotFrame
          ariaLabel="Wrapped rotating-frame angle versus guiding-center radial offset"
          paths={phasePaths}
          xRange={phiRange}
          yRange={rOffsetRange}
          xLabel="φ [deg]"
          yLabel="r − 1"
          current={{ x: currentPhiDegrees, y: currentPoint.r - 1 }}
          xTickFormat={(value) => value.toFixed(0)}
          yTickFormat={(value) => value.toFixed(3)}
          horizontalReference={0}
          className="phase-space-plot"
          height={phaseHeight}
        />
      </PlotCard>
    </section>
  )
}
