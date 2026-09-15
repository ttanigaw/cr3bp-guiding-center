import { useEffect, useMemo, useState } from 'react'
import { diagnosticSample, trajectoryDiagnosticData, type DiagnosticSample } from '../diagnostics/diagnosticData'
import {
  diagnosticVariableByKey,
  diagnosticVariables,
  splitDiagnosticSegments,
  type DiagnosticVariableDefinition,
  type DiagnosticVariableKey,
} from '../diagnostics/diagnosticVariables'
import type { TrajectoryPoint } from '../physics/integrator'
import {
  buildAxisScale,
  formatLog10Tick,
  isLogScaleAvailable,
  transformAxisValue,
  type AxisScaleMode,
  type PlotRange,
} from '../visualization/customPlotScale'
import './CustomDiagnosticPlot.css'

interface CustomDiagnosticPlotProps {
  trajectory: readonly TrajectoryPoint[]
  currentPoint: TrajectoryPoint
  mu: number
}

const WIDTH = 720
const HEIGHT = 300
const MARGIN = { left: 70, right: 22, top: 18, bottom: 48 }
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const MAX_RENDER_POINTS_PER_SEGMENT = 1800

function scaleX(value: number, range: PlotRange): number {
  return MARGIN.left + ((value - range.min) / (range.max - range.min)) * INNER_WIDTH
}

function scaleY(value: number, range: PlotRange): number {
  return MARGIN.top + (1 - (value - range.min) / (range.max - range.min)) * INNER_HEIGHT
}

function sampledSegment(samples: DiagnosticSample[]): DiagnosticSample[] {
  if (samples.length <= MAX_RENDER_POINTS_PER_SEGMENT) return samples
  const stride = Math.ceil(samples.length / MAX_RENDER_POINTS_PER_SEGMENT)
  const sampled = samples.filter((_, index) => index % stride === 0)
  const finalSample = samples[samples.length - 1]
  if (sampled[sampled.length - 1] !== finalSample) sampled.push(finalSample)
  return sampled
}

function pathFromSamples(
  samples: DiagnosticSample[],
  xDefinition: DiagnosticVariableDefinition,
  yDefinition: DiagnosticVariableDefinition,
  xMode: AxisScaleMode,
  yMode: AxisScaleMode,
  xRange: PlotRange,
  yRange: PlotRange,
): string {
  return sampledSegment(samples)
    .map((sample, index) => {
      const xValue = transformAxisValue(xDefinition.value(sample), xMode)
      const yValue = transformAxisValue(yDefinition.value(sample), yMode)
      const x = scaleX(xValue, xRange)
      const y = scaleY(yValue, yRange)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`
    })
    .join(' ')
}

function referenceInRange(reference: number | undefined, range: PlotRange): reference is number {
  return reference !== undefined && reference >= range.min && reference <= range.max
}

function axisLabel(definition: DiagnosticVariableDefinition, mode: AxisScaleMode): string {
  return mode === 'log10' ? `log10(${definition.axisLabel})` : definition.axisLabel
}

function formatAxisTick(
  value: number,
  definition: DiagnosticVariableDefinition,
  mode: AxisScaleMode,
): string {
  return mode === 'log10' ? formatLog10Tick(value) : definition.formatTick(value)
}

export default function CustomDiagnosticPlot({
  trajectory,
  currentPoint,
  mu,
}: CustomDiagnosticPlotProps) {
  const [xKey, setXKey] = useState<DiagnosticVariableKey>('t')
  const [yKey, setYKey] = useState<DiagnosticVariableKey>('deltaHGc')
  const [xScaleMode, setXScaleMode] = useState<AxisScaleMode>('linear')
  const [yScaleMode, setYScaleMode] = useState<AxisScaleMode>('linear')

  const samples = useMemo(() => trajectoryDiagnosticData(trajectory, mu), [trajectory, mu])
  const initialHamiltonian = samples[0].hGc
  const current = diagnosticSample(currentPoint, mu, initialHamiltonian)
  const xDefinition = diagnosticVariableByKey[xKey]
  const yDefinition = diagnosticVariableByKey[yKey]
  const xValues = useMemo(() => samples.map(xDefinition.value), [samples, xDefinition])
  const yValues = useMemo(() => samples.map(yDefinition.value), [samples, yDefinition])
  const xLogAvailable = isLogScaleAvailable(xValues)
  const yLogAvailable = isLogScaleAvailable(yValues)
  const resolvedXScale: AxisScaleMode = xScaleMode === 'log10' && xLogAvailable ? 'log10' : 'linear'
  const resolvedYScale: AxisScaleMode = yScaleMode === 'log10' && yLogAvailable ? 'log10' : 'linear'

  useEffect(() => {
    if (xScaleMode === 'log10' && !xLogAvailable) setXScaleMode('linear')
  }, [xScaleMode, xLogAvailable])

  useEffect(() => {
    if (yScaleMode === 'log10' && !yLogAvailable) setYScaleMode('linear')
  }, [yScaleMode, yLogAvailable])

  const xLayout = useMemo(
    () => buildAxisScale(xValues, xDefinition.minimumSpan, xDefinition.referenceValue, resolvedXScale),
    [xValues, xDefinition, resolvedXScale],
  )
  const yLayout = useMemo(
    () => buildAxisScale(yValues, yDefinition.minimumSpan, yDefinition.referenceValue, resolvedYScale),
    [yValues, yDefinition, resolvedYScale],
  )
  const paths = useMemo(
    () => splitDiagnosticSegments(samples, xKey, yKey).map((segment) =>
      pathFromSamples(
        segment,
        xDefinition,
        yDefinition,
        resolvedXScale,
        resolvedYScale,
        xLayout.range,
        yLayout.range,
      )),
    [
      samples,
      xKey,
      yKey,
      xDefinition,
      yDefinition,
      resolvedXScale,
      resolvedYScale,
      xLayout.range,
      yLayout.range,
    ],
  )

  const currentX = transformAxisValue(xDefinition.value(current), resolvedXScale)
  const currentY = transformAxisValue(yDefinition.value(current), resolvedYScale)
  const usesWrappedPhi = xDefinition.wrappedAngle === true || yDefinition.wrappedAngle === true
  const xAxisLabel = axisLabel(xDefinition, resolvedXScale)
  const yAxisLabel = axisLabel(yDefinition, resolvedYScale)

  const handleXVariableChange = (nextKey: DiagnosticVariableKey) => {
    const nextDefinition = diagnosticVariableByKey[nextKey]
    const nextValues = samples.map(nextDefinition.value)
    setXKey(nextKey)
    if (xScaleMode === 'log10' && !isLogScaleAvailable(nextValues)) setXScaleMode('linear')
  }

  const handleYVariableChange = (nextKey: DiagnosticVariableKey) => {
    const nextDefinition = diagnosticVariableByKey[nextKey]
    const nextValues = samples.map(nextDefinition.value)
    setYKey(nextKey)
    if (yScaleMode === 'log10' && !isLogScaleAvailable(nextValues)) setYScaleMode('linear')
  }

  return (
    <section className="custom-diagnostic-card" aria-labelledby="custom-plot-title">
      <div className="custom-plot-heading">
        <div>
          <p className="eyebrow">Explore the calculated trajectory</p>
          <h2 id="custom-plot-title">Custom X–Y plot</h2>
          <p className="plot-note">
            Full calculated curve; the bright-green marker follows the shared animation time.
            {usesWrappedPhi ? ' Wrapped φ discontinuities are not connected.' : ''}
          </p>
        </div>
        <div className="custom-plot-controls" aria-label="Custom diagnostic plot axes">
          <div className="custom-axis-control">
            <span className="custom-axis-heading">X axis</span>
            <label>
              <span>Variable</span>
              <select
                aria-label="Custom plot X axis"
                value={xKey}
                onChange={(event) => handleXVariableChange(event.target.value as DiagnosticVariableKey)}
              >
                {diagnosticVariables.map((definition) => (
                  <option key={definition.key} value={definition.key}>{definition.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Scale</span>
              <select
                aria-label="Custom plot X scale"
                value={resolvedXScale}
                onChange={(event) => setXScaleMode(event.target.value as AxisScaleMode)}
              >
                <option value="linear">Linear</option>
                <option value="log10" disabled={!xLogAvailable}>log10</option>
              </select>
            </label>
          </div>

          <div className="custom-axis-control">
            <span className="custom-axis-heading">Y axis</span>
            <label>
              <span>Variable</span>
              <select
                aria-label="Custom plot Y axis"
                value={yKey}
                onChange={(event) => handleYVariableChange(event.target.value as DiagnosticVariableKey)}
              >
                {diagnosticVariables.map((definition) => (
                  <option key={definition.key} value={definition.key}>{definition.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Scale</span>
              <select
                aria-label="Custom plot Y scale"
                value={resolvedYScale}
                onChange={(event) => setYScaleMode(event.target.value as AxisScaleMode)}
              >
                <option value="linear">Linear</option>
                <option value="log10" disabled={!yLogAvailable}>log10</option>
              </select>
            </label>
          </div>
          <p className="custom-scale-note">log10 is available only when every plotted value on that axis is strictly positive.</p>
        </div>
      </div>

      <svg
        className="custom-diagnostic-plot"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Custom diagnostic plot: ${yAxisLabel} versus ${xAxisLabel}`}
        data-x-variable={xKey}
        data-y-variable={yKey}
        data-x-scale={resolvedXScale}
        data-y-scale={resolvedYScale}
      >
        {xLayout.ticks.map((tick) => {
          const x = scaleX(tick, xLayout.range)
          return (
            <g key={`x-${tick}`}>
              <line className="state-grid-line" x1={x} y1={MARGIN.top} x2={x} y2={MARGIN.top + INNER_HEIGHT} />
              <text className="state-tick-label custom-x-tick-label" x={x} y={HEIGHT - 23} textAnchor="middle">
                {formatAxisTick(tick, xDefinition, resolvedXScale)}
              </text>
            </g>
          )
        })}

        {yLayout.ticks.map((tick) => {
          const y = scaleY(tick, yLayout.range)
          return (
            <g key={`y-${tick}`}>
              <line className="state-grid-line" x1={MARGIN.left} y1={y} x2={MARGIN.left + INNER_WIDTH} y2={y} />
              <text className="state-tick-label custom-y-tick-label" x={MARGIN.left - 9} y={y + 4} textAnchor="end">
                {formatAxisTick(tick, yDefinition, resolvedYScale)}
              </text>
            </g>
          )
        })}

        {referenceInRange(xLayout.transformedReference, xLayout.range) && (
          <line
            className="state-reference-line custom-reference-line"
            x1={scaleX(xLayout.transformedReference, xLayout.range)}
            y1={MARGIN.top}
            x2={scaleX(xLayout.transformedReference, xLayout.range)}
            y2={MARGIN.top + INNER_HEIGHT}
          />
        )}
        {referenceInRange(yLayout.transformedReference, yLayout.range) && (
          <line
            className="state-reference-line custom-reference-line"
            x1={MARGIN.left}
            y1={scaleY(yLayout.transformedReference, yLayout.range)}
            x2={MARGIN.left + INNER_WIDTH}
            y2={scaleY(yLayout.transformedReference, yLayout.range)}
          />
        )}

        <line className="state-axis-line" x1={MARGIN.left} y1={MARGIN.top + INNER_HEIGHT} x2={MARGIN.left + INNER_WIDTH} y2={MARGIN.top + INNER_HEIGHT} />
        <line className="state-axis-line" x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + INNER_HEIGHT} />

        {paths.map((path, index) => (
          <path key={`${xKey}-${yKey}-${index}`} className="state-data-line custom-diagnostic-path" d={path} />
        ))}

        <circle
          className="custom-diagnostic-current-marker"
          cx={scaleX(currentX, xLayout.range)}
          cy={scaleY(currentY, yLayout.range)}
          r="5"
        />

        <text className="state-axis-title custom-x-axis-title" x={MARGIN.left + INNER_WIDTH / 2} y={HEIGHT - 4} textAnchor="middle">
          {xAxisLabel}
        </text>
        <text
          className="state-axis-title custom-y-axis-title"
          x="16"
          y={MARGIN.top + INNER_HEIGHT / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${MARGIN.top + INNER_HEIGHT / 2})`}
        >
          {yAxisLabel}
        </text>
      </svg>
    </section>
  )
}
