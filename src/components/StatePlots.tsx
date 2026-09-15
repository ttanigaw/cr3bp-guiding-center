import { useState, type ReactNode } from 'react'
import type { TrajectoryPoint } from '../physics/integrator'
import { sampleTrajectory, wrapPhiDegrees, wrappedPlotSegments } from '../visualization/plotData'
import {
  anchoredTicks,
  closeUpPhiRange,
  niceOuterRange,
  selectLagrangeAnchor,
  type PlotRange,
} from '../visualization/plotScale'

interface StatePlotsProps {
  trajectory: TrajectoryPoint[]
  currentPoint: TrajectoryPoint
  mu: number
  showLagrangePoints: boolean
}

interface PlotPath {
  key: string
  d: string
}

interface PlotMarker {
  key: string
  x: number
  y: number
  className: string
}

type PhaseSpaceScaleMode = 'auto' | 'equal'
type PhaseSpaceWidthMode = 'full' | 'closeup-origin' | 'closeup'

const WIDTH = 640
const DEFAULT_HEIGHT = 260
const MARGIN = { left: 58, right: 18, top: 18, bottom: 42 }
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const DEFAULT_INNER_HEIGHT = DEFAULT_HEIGHT - MARGIN.top - MARGIN.bottom
const RAD_TO_DEG = 180 / Math.PI

function paddedRange(values: number[], includeValue: number, minimumSpan: number): PlotRange {
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

function makeTicks(range: PlotRange, count = 5): number[] {
  if (count <= 1) return [range.min]
  if (count === 2) return [range.min, range.max]
  return Array.from({ length: count }, (_, index) => range.min + ((range.max - range.min) * index) / (count - 1))
}

function scaleX(value: number, range: PlotRange): number {
  return MARGIN.left + ((value - range.min) / (range.max - range.min)) * INNER_WIDTH
}

function scaleY(value: number, range: PlotRange, innerHeight: number): number {
  return MARGIN.top + (1 - (value - range.min) / (range.max - range.min)) * innerHeight
}

function pathFromPoints(
  points: Array<{ x: number; y: number }>,
  xRange: PlotRange,
  yRange: PlotRange,
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

function equalScaleInnerHeight(xRange: PlotRange, yRange: PlotRange): number {
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
  verticalReference,
  markers = [],
  className,
  height = DEFAULT_HEIGHT,
  yTickCount = 5,
  xTicks: suppliedXTicks,
  yTicks: suppliedYTicks,
}: {
  ariaLabel: string
  paths: PlotPath[]
  xRange: PlotRange
  yRange: PlotRange
  xLabel: string
  yLabel: string
  current: { x: number; y: number }
  xTickFormat: (value: number) => string
  yTickFormat: (value: number) => string
  horizontalReference?: number
  verticalReference?: number
  markers?: PlotMarker[]
  className?: string
  height?: number
  yTickCount?: number
  xTicks?: number[]
  yTicks?: number[]
}) {
  const innerHeight = height - MARGIN.top - MARGIN.bottom
  const xTicks = suppliedXTicks ?? makeTicks(xRange)
  const yTicks = suppliedYTicks ?? makeTicks(yRange, yTickCount)

  return (
    <svg
      className={`state-plot${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label={ariaLabel}
      data-x-min={xRange.min}
      data-x-max={xRange.max}
      data-y-min={yRange.min}
      data-y-max={yRange.max}
    >
      {xTicks.map((tick) => {
        const x = scaleX(tick, xRange)
        const isReference = verticalReference !== undefined && Math.abs(tick - verticalReference) < 1e-10
        return (
          <g key={`x-${tick}`}>
            <line
              className={isReference ? 'state-reference-line phase-anchor-line' : 'state-grid-line'}
              x1={x}
              y1={MARGIN.top}
              x2={x}
              y2={MARGIN.top + innerHeight}
            />
            <text
              className={`state-tick-label state-x-tick-label${isReference ? ' phase-anchor-tick-label' : ''}`}
              x={x}
              y={height - 20}
              textAnchor="middle"
            >
              {xTickFormat(tick)}
            </text>
          </g>
        )
      })}

      {yTicks.map((tick) => {
        const y = scaleY(tick, yRange, innerHeight)
        const isReference = horizontalReference !== undefined && Math.abs(tick - horizontalReference) < 1e-12
        return (
          <g key={`y-${tick}`}>
            <line
              className={isReference ? 'state-reference-line' : 'state-grid-line'}
              x1={MARGIN.left}
              y1={y}
              x2={MARGIN.left + INNER_WIDTH}
              y2={y}
            />
            <text
              className="state-tick-label state-y-tick-label"
              x={MARGIN.left - 9}
              y={y + 4}
              textAnchor="end"
            >
              {yTickFormat(tick)}
            </text>
          </g>
        )
      })}

      {horizontalReference !== undefined && !yTicks.some((tick) => Math.abs(tick - horizontalReference) < 1e-12) && horizontalReference >= yRange.min && horizontalReference <= yRange.max && (
        <line
          className="state-reference-line"
          x1={MARGIN.left}
          y1={scaleY(horizontalReference, yRange, innerHeight)}
          x2={MARGIN.left + INNER_WIDTH}
          y2={scaleY(horizontalReference, yRange, innerHeight)}
        />
      )}

      {verticalReference !== undefined && !xTicks.some((tick) => Math.abs(tick - verticalReference) < 1e-10) && verticalReference >= xRange.min && verticalReference <= xRange.max && (
        <line
          className="state-reference-line phase-anchor-line"
          x1={scaleX(verticalReference, xRange)}
          y1={MARGIN.top}
          x2={scaleX(verticalReference, xRange)}
          y2={MARGIN.top + innerHeight}
        />
      )}

      <line className="state-axis-line" x1={MARGIN.left} y1={MARGIN.top + innerHeight} x2={MARGIN.left + INNER_WIDTH} y2={MARGIN.top + innerHeight} />
      <line className="state-axis-line" x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + innerHeight} />

      {paths.map((path) => <path key={path.key} className="state-data-line" d={path.d} />)}

      {markers.map((marker) => (
        <circle
          key={marker.key}
          className={marker.className}
          cx={scaleX(marker.x, xRange)}
          cy={scaleY(marker.y, yRange, innerHeight)}
          r="5"
        />
      ))}

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

function ScaleChoice({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="phase-option-group">
      <span className="phase-option-label">{label}</span>
      <div className="panel-option-buttons">{children}</div>
    </div>
  )
}

export default function StatePlots({ trajectory, currentPoint, mu, showLagrangePoints }: StatePlotsProps) {
  const [phaseSpaceScaleMode, setPhaseSpaceScaleMode] = useState<PhaseSpaceScaleMode>('auto')
  const [phaseSpaceWidthMode, setPhaseSpaceWidthMode] = useState<PhaseSpaceWidthMode>('full')
  const sampled = sampleTrajectory(trajectory)
  const timeMax = Math.max(trajectory[trajectory.length - 1]?.t ?? 0, 1e-9)
  const timeRange = { min: 0, max: timeMax }

  const rRange = paddedRange(sampled.map((point) => point.r), 1, 0.02)
  const rPath = pathFromPoints(sampled.map((point) => ({ x: point.t, y: point.r })), timeRange, rRange)

  const wrappedSegments = wrappedPlotSegments(sampled)
  const fullPhiRange = { min: -180, max: 180 }
  const phiPaths = wrappedSegments.map((segment, index) => ({
    key: `phi-${index}`,
    d: pathFromPoints(segment.map((point) => ({ x: point.t, y: point.phiDegrees })), timeRange, fullPhiRange),
  }))

  const phasePhiValues = wrappedSegments.flatMap((segment) => segment.map((point) => point.phiDegrees))
  const lagrangeAnchor = selectLagrangeAnchor(phasePhiValues)
  const phaseCrossesWrap = wrappedSegments.length > 1
  const phaseUsesFullWidth = phaseSpaceWidthMode === 'full' || phaseCrossesWrap
  const closeUpValues = phaseSpaceWidthMode === 'closeup-origin'
    ? [...phasePhiValues, 0]
    : phasePhiValues
  const phasePhiRange = phaseUsesFullWidth
    ? fullPhiRange
    : closeUpPhiRange(closeUpValues, lagrangeAnchor)
  const phaseShowsOrigin = phasePhiRange.min <= 0 && phasePhiRange.max >= 0
  const phaseVerticalValues = sampled.map((point) => point.r - 1)
  if (phaseShowsOrigin) phaseVerticalValues.push(-mu)
  const rOffsetRange = niceOuterRange(phaseVerticalValues, 0, 0.02)
  const phaseInnerHeight = phaseSpaceScaleMode === 'equal'
    ? equalScaleInnerHeight(phasePhiRange, rOffsetRange)
    : DEFAULT_INNER_HEIGHT
  const phaseHeight = MARGIN.top + phaseInnerHeight + MARGIN.bottom
  const usesCloseUpTicks = phaseSpaceWidthMode !== 'full' && !phaseCrossesWrap
  const closeUpXTicks = usesCloseUpTicks
    ? anchoredTicks(phasePhiRange, lagrangeAnchor)
    : undefined
  const closeUpYTicks = phaseSpaceWidthMode !== 'full'
    ? anchoredTicks(rOffsetRange, 0, phaseInnerHeight < 120 ? 2 : 5)
    : undefined
  const phasePaths = wrappedSegments.map((segment, index) => ({
    key: `phase-${index}`,
    d: pathFromPoints(
      segment.map((point) => ({ x: point.phiDegrees, y: point.rOffset })),
      phasePhiRange,
      rOffsetRange,
      phaseInnerHeight,
    ),
  }))

  const currentPhiDegrees = wrapPhiDegrees(currentPoint.phi)
  const phaseNote = phaseSpaceScaleMode === 'equal'
    ? '1:1 vertical scale uses (r − 1) × 180/π; horizontal range follows the selected width mode'
    : 'Magnified vertical scale; horizontal range follows the selected width mode'
  const phaseMarkers: PlotMarker[] = []
  if (phaseShowsOrigin) {
    phaseMarkers.push({ key: 'secondary', x: 0, y: -mu, className: 'secondary-body phase-secondary-point' })
  }
  if (showLagrangePoints) {
    for (const longitude of [-60, 60]) {
      if (longitude >= phasePhiRange.min && longitude <= phasePhiRange.max) {
        phaseMarkers.push({
          key: `lagrange-${longitude}`,
          x: longitude,
          y: 0,
          className: 'lagrange-point phase-lagrange-point',
        })
      }
    }
  }

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
          yRange={fullPhiRange}
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
          <div className="phase-display-controls" aria-label="Phase-space display options">
            <ScaleChoice label="Vertical scale">
              <button
                type="button"
                className={`toggle-button${phaseSpaceScaleMode === 'auto' ? ' active' : ''}`}
                aria-pressed={phaseSpaceScaleMode === 'auto'}
                onClick={() => setPhaseSpaceScaleMode('auto')}
              >
                Magnify
              </button>
              <button
                type="button"
                className={`toggle-button${phaseSpaceScaleMode === 'equal' ? ' active' : ''}`}
                aria-pressed={phaseSpaceScaleMode === 'equal'}
                onClick={() => setPhaseSpaceScaleMode('equal')}
              >
                1:1 scale
              </button>
            </ScaleChoice>
            <ScaleChoice label="Horizontal range">
              <button
                type="button"
                className={`toggle-button${phaseSpaceWidthMode === 'full' ? ' active' : ''}`}
                aria-pressed={phaseSpaceWidthMode === 'full'}
                onClick={() => setPhaseSpaceWidthMode('full')}
              >
                Full width
              </button>
              <button
                type="button"
                className={`toggle-button${phaseSpaceWidthMode === 'closeup-origin' ? ' active' : ''}`}
                aria-pressed={phaseSpaceWidthMode === 'closeup-origin'}
                onClick={() => setPhaseSpaceWidthMode('closeup-origin')}
              >
                Close-up with origin
              </button>
              <button
                type="button"
                className={`toggle-button${phaseSpaceWidthMode === 'closeup' ? ' active' : ''}`}
                aria-pressed={phaseSpaceWidthMode === 'closeup'}
                onClick={() => setPhaseSpaceWidthMode('closeup')}
              >
                Close-up
              </button>
            </ScaleChoice>
          </div>
        )}
      >
        <PlotFrame
          ariaLabel="Wrapped rotating-frame angle versus guiding-center radial offset"
          paths={phasePaths}
          xRange={phasePhiRange}
          yRange={rOffsetRange}
          xLabel="φ [deg]"
          yLabel="r − 1"
          current={{ x: currentPhiDegrees, y: currentPoint.r - 1 }}
          xTickFormat={(value) => value.toFixed(0)}
          yTickFormat={(value) => Math.abs(value) >= 0.1 ? value.toFixed(1) : value.toFixed(3)}
          horizontalReference={0}
          verticalReference={usesCloseUpTicks ? lagrangeAnchor : undefined}
          markers={phaseMarkers}
          className="phase-space-plot"
          height={phaseHeight}
          xTicks={closeUpXTicks}
          yTicks={closeUpYTicks}
        />
      </PlotCard>
    </section>
  )
}
