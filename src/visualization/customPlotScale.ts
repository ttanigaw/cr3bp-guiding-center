export type AxisScaleMode = 'linear' | 'log10'

export interface PlotRange {
  min: number
  max: number
}

export interface AxisScaleLayout {
  range: PlotRange
  ticks: number[]
  transformedReference?: number
}

const DEFAULT_TARGET_INTERVALS = 4
const PADDING_FRACTION = 0.08
const MINIMUM_LOG_SPAN = 0.25
const RELATIVE_DEGENERATE_TOLERANCE = 1e-12

export function isLogScaleAvailable(values: readonly number[]): boolean {
  return values.length > 0 && values.every((value) => Number.isFinite(value) && value > 0)
}

export function transformAxisValue(value: number, mode: AxisScaleMode): number {
  if (mode === 'linear') return value
  if (!(value > 0) || !Number.isFinite(value)) {
    throw new RangeError('log10 axis values must be finite and strictly positive')
  }
  return Math.log10(value)
}

function niceStep(rawStep: number): number {
  if (!(rawStep > 0) || !Number.isFinite(rawStep)) return 1

  const exponent = Math.floor(Math.log10(rawStep))
  const scale = 10 ** exponent
  const normalized = rawStep / scale

  const niceNormalized =
    normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : normalized < 7.5 ? 5 : 10

  return niceNormalized * scale
}

function cleanTick(value: number): number {
  if (Math.abs(value) < 1e-14) return 0
  return Number(value.toPrecision(12))
}

function isEffectivelyDegenerate(min: number, max: number): boolean {
  const span = max - min
  if (!(span > 0) || !Number.isFinite(span)) return true

  const characteristicMagnitude = Math.max(Math.abs(min), Math.abs(max))
  if (!(characteristicMagnitude > 0)) return false

  return span <= characteristicMagnitude * RELATIVE_DEGENERATE_TOLERANCE
}

function expandDegenerateRange(
  min: number,
  max: number,
  fallbackSpan: number,
  referenceAtLowerBoundary: boolean,
  referenceAtUpperBoundary: boolean,
): PlotRange {
  if (referenceAtLowerBoundary) {
    return { min, max: min + fallbackSpan }
  }
  if (referenceAtUpperBoundary) {
    return { min: max - fallbackSpan, max }
  }

  const center = (min + max) / 2
  return {
    min: center - fallbackSpan / 2,
    max: center + fallbackSpan / 2,
  }
}

export function niceTicks(range: PlotRange, targetIntervals = DEFAULT_TARGET_INTERVALS): number[] {
  const span = range.max - range.min
  const step = niceStep(span / Math.max(targetIntervals, 1))
  const containsZero = range.min <= 0 && range.max >= 0
  const epsilon = step * 1e-10
  const ticks: number[] = []

  if (containsZero) {
    const firstIndex = Math.ceil((range.min - epsilon) / step)
    const lastIndex = Math.floor((range.max + epsilon) / step)
    for (let index = firstIndex; index <= lastIndex; index += 1) {
      ticks.push(cleanTick(index * step))
    }
    if (!ticks.some((tick) => tick === 0)) ticks.push(0)
    return ticks.sort((a, b) => a - b)
  }

  const first = Math.ceil((range.min - epsilon) / step) * step
  for (let tick = first; tick <= range.max + epsilon; tick += step) {
    ticks.push(cleanTick(tick))
  }

  if (ticks.length >= 2) return ticks
  return [cleanTick(range.min), cleanTick(range.max)]
}

export function buildAxisScale(
  values: readonly number[],
  fallbackLinearSpan: number,
  referenceValue: number | undefined,
  mode: AxisScaleMode,
): AxisScaleLayout {
  if (values.length === 0) {
    throw new RangeError('axis values must contain at least one value')
  }
  if (mode === 'log10' && !isLogScaleAvailable(values)) {
    throw new RangeError('log10 axis requires all values to be strictly positive')
  }

  const transformedValues = values.map((value) => transformAxisValue(value, mode))
  const transformedReference =
    referenceValue !== undefined && (mode === 'linear' || referenceValue > 0)
      ? transformAxisValue(referenceValue, mode)
      : undefined

  let min = Math.min(...transformedValues)
  let max = Math.max(...transformedValues)
  if (transformedReference !== undefined) {
    min = Math.min(min, transformedReference)
    max = Math.max(max, transformedReference)
  }

  const rawMin = min
  const rawMax = max
  const referenceAtLowerBoundary =
    transformedReference !== undefined && transformedReference === rawMin && rawMin < rawMax
  const referenceAtUpperBoundary =
    transformedReference !== undefined && transformedReference === rawMax && rawMin < rawMax

  const shouldUseFallback = mode === 'linear'
    ? isEffectivelyDegenerate(min, max)
    : max - min < MINIMUM_LOG_SPAN

  if (shouldUseFallback) {
    const fallbackSpan = mode === 'linear' ? fallbackLinearSpan : MINIMUM_LOG_SPAN
    ;({ min, max } = expandDegenerateRange(
      min,
      max,
      fallbackSpan,
      referenceAtLowerBoundary,
      referenceAtUpperBoundary,
    ))
  }

  const span = max - min
  const padding = span * PADDING_FRACTION
  min -= padding
  max += padding

  if (referenceAtLowerBoundary) min = transformedReference
  if (referenceAtUpperBoundary) max = transformedReference

  const range = { min, max }
  return {
    range,
    ticks: niceTicks(range),
    transformedReference,
  }
}

export function formatLog10Tick(value: number): string {
  if (Math.abs(value) < 1e-12) return '0'
  if (Math.abs(value - Math.round(value)) < 1e-10) return String(Math.round(value))
  if (Math.abs(value) >= 10) return value.toFixed(1)
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}
