import { useMemo, useState } from 'react'
import { diagnosticSample, trajectoryDiagnosticData, type DiagnosticSample } from '../diagnostics/diagnosticData'
import {
  diagnosticVariableByKey,
  diagnosticVariables,
  splitDiagnosticSegments,
  type DiagnosticVariableDefinition,
  type DiagnosticVariableKey,
} from '../diagnostics/diagnosticVariables'
import type { TrajectoryPoint } from '../physics/integrator'

interface CustomDiagnosticPlotProps {
  trajectory: readonly TrajectoryPoint[]
  currentPoint: TrajectoryPoint
  mu: number
}

interface Range {
  min: number
  max: number
}

const WIDTH = 720
const HEIGHT = 300
const MARGIN = { left: 70, right: 22, top: 18, bottom: 48 }
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const MAX_RENDER_POINTS_PER_SEGMENT = 1800

function autoRange(values: number[], definition: DiagnosticVariableDefinition): Range {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const value of values) {
    min = Math.min(min, value)
    max = Math.max(max, value)
  }

  if (definition.referenceValue !== undefined) {
    min = Math.min(min, definition.referenceValue)
    max = Math.max(max, definition.referenceValue)
  }

  if (max - min < definition.minimumSpan) {
    const center = (min + max) / 2
    min = center - definition.minimumSpan / 2
    max = center + definition.minimumSpan / 2
  }

  const span = max - min
  const padding = span * 0.08
  return { min: min - padding, max: max + padding }
}

function makeTicks(range: Range, count = 5): number[] {
  return Array.from(
    { length: count },
    (_, index) => range.min + ((range.max - range.min) * index) / (count - 1),
  )
}

function scaleX(value: number, range: Range): number {
  return MARGIN.left + ((value - range.min) / (range.max - range.min)) * INNER_WIDTH
}

function scaleY(value: number, range: Range): number {
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
  xRange: Range,
  yRange: Range,
): string {
  return sampledSegment(samples)
    .map((sample, index) => {
      const x = scaleX(xDefinition.value(sample), xRange)
      const y = scaleY(yDefinition.value(sample), yRange)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`
    })
    .join(' ')
}

function referenceInRange(reference: number | undefined, range: Range): reference is number {
  return reference !== undefined && reference >= range.min && reference <= range.max
}

export default function CustomDiagnosticPlot({
  trajectory,
  currentPoint,
  mu,
}: CustomDiagnosticPlotProps) {
  const [xKey, setXKey] = useState<DiagnosticVariableKey>('t')
  const [yKey, setYKey] = useState<DiagnosticVariableKey>('deltaHGc')

  const samples = useMemo(() => trajectoryDiagnosticData(trajectory, mu), [trajectory, mu])
  const initialHamiltonian = samples[0].hGc
  const current = diagnosticSample(currentPoint, mu, initialHamiltonian)
  const xDefinition = diagnosticVariableByKey[xKey]
  const yDefinition = diagnosticVariableByKey[yKey]

  const xRange = useMemo(
    () => autoRange(samples.map(xDefinition.value), xDefinition),
    [samples, xDefinition],
  )
  const yRange = useMemo(
    () => autoRange(samples.map(yDefinition.value), yDefinition),
    [samples, yDefinition],
  )
  const paths = useMemo(
    () => splitDiagnosticSegments(samples, xKey, yKey).map((segment) =>
      pathFromSamples(segment, xDefinition, yDefinition, xRange, yRange)),
    [samples, xKey, yKey, xDefinition, yDefinition, xRange, yRange],
  )

  const xTicks = makeTicks(xRange)
  const yTicks = makeTicks(yRange)
  const currentX = xDefinition.value(current)
  const currentY = yDefinition.value(current)
  const usesWrappedPhi = xDefinition.wrappedAngle === true || yDefinition.wrappedAngle === true

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
          <label>
            <span>X axis</span>
            <select
              aria-label="Custom plot X axis"
              value={xKey}
              onChange={(event) => setXKey(event.target.value as DiagnosticVariableKey)}
            >
              {diagnosticVariables.map((definition) => (
                <option key={definition.key} value={definition.key}>{definition.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Y axis</span>
            <select
              aria-label="Custom plot Y axis"
              value={yKey}
              onChange={(event) => setYKey(event.target.value as DiagnosticVariableKey)}
            >
              {diagnosticVariables.map((definition) => (
                <option key={definition.key} value={definition.key}>{definition.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <svg
        className="custom-diagnostic-plot"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Custom diagnostic plot: ${yDefinition.axisLabel} versus ${xDefinition.axisLabel}`}
        data-x-variable={xKey}
        data-y-variable={yKey}
      >
        {xTicks.map((tick) => {
          const x = scaleX(tick, xRange)
          return (
            <g key={`x-${tick}`}>
              <line className="state-grid-line" x1={x} y1={MARGIN.top} x2={x} y2={MARGIN.top + INNER_HEIGHT} />
              <text className="state-tick-label" x={x} y={HEIGHT - 23} textAnchor="middle">
                {xDefinition.formatTick(tick)}
              </text>
            </g>
          )
        })}

        {yTicks.map((tick) => {
          const y = scaleY(tick, yRange)
          return (
            <g key={`y-${tick}`}>
              <line className="state-grid-line" x1={MARGIN.left} y1={y} x2={MARGIN.left + INNER_WIDTH} y2={y} />
              <text className="state-tick-label" x={MARGIN.left - 9} y={y + 4} textAnchor="end">
                {yDefinition.formatTick(tick)}
              </text>
            </g>
          )
        })}

        {referenceInRange(xDefinition.referenceValue, xRange) && (
          <line
            className="state-reference-line custom-reference-line"
            x1={scaleX(xDefinition.referenceValue, xRange)}
            y1={MARGIN.top}
            x2={scaleX(xDefinition.referenceValue, xRange)}
            y2={MARGIN.top + INNER_HEIGHT}
          />
        )}
        {referenceInRange(yDefinition.referenceValue, yRange) && (
          <line
            className="state-reference-line custom-reference-line"
            x1={MARGIN.left}
            y1={scaleY(yDefinition.referenceValue, yRange)}
            x2={MARGIN.left + INNER_WIDTH}
            y2={scaleY(yDefinition.referenceValue, yRange)}
          />
        )}

        <line className="state-axis-line" x1={MARGIN.left} y1={MARGIN.top + INNER_HEIGHT} x2={MARGIN.left + INNER_WIDTH} y2={MARGIN.top + INNER_HEIGHT} />
        <line className="state-axis-line" x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + INNER_HEIGHT} />

        {paths.map((path, index) => (
          <path key={`${xKey}-${yKey}-${index}`} className="state-data-line custom-diagnostic-path" d={path} />
        ))}

        <circle
          className="custom-diagnostic-current-marker"
          cx={scaleX(currentX, xRange)}
          cy={scaleY(currentY, yRange)}
          r="5"
        />

        <text className="state-axis-title" x={MARGIN.left + INNER_WIDTH / 2} y={HEIGHT - 4} textAnchor="middle">
          {xDefinition.axisLabel}
        </text>
        <text
          className="state-axis-title"
          x="16"
          y={MARGIN.top + INNER_HEIGHT / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${MARGIN.top + INNER_HEIGHT / 2})`}
        >
          {yDefinition.axisLabel}
        </text>
      </svg>
    </section>
  )
}
