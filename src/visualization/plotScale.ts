export interface PlotRange {
  min: number
  max: number
}

export type LagrangeAnchorDegrees = -60 | 60

const DEFAULT_PADDING_FRACTION = 0.08
const CLOSE_UP_ANGLE_STEP = 5
const LAGRANGE_LONGITUDES: LagrangeAnchorDegrees[] = [-60, 60]

function ensureMinimumSpan(min: number, max: number, minimumSpan: number): PlotRange {
  if (max - min >= minimumSpan) {
    return { min, max }
  }

  const center = (min + max) / 2
  return {
    min: center - minimumSpan / 2,
    max: center + minimumSpan / 2,
  }
}

function paddedRange(min: number, max: number, paddingFraction: number): PlotRange {
  const span = max - min
  const padding = span * paddingFraction
  return { min: min - padding, max: max + padding }
}

export function niceCeilingMagnitude(value: number): number {
  if (!(value > 0) || !Number.isFinite(value)) {
    return 0
  }

  const exponent = Math.floor(Math.log10(value))
  const scale = 10 ** exponent
  const normalized = value / scale
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return niceNormalized * scale
}

export function niceOuterRange(
  values: number[],
  includeValue: number,
  minimumSpan: number,
  paddingFraction = DEFAULT_PADDING_FRACTION,
): PlotRange {
  const rawMin = Math.min(includeValue, ...values)
  const rawMax = Math.max(includeValue, ...values)
  const oneSidedPositive = rawMin === includeValue && rawMax > includeValue
  const oneSidedNegative = rawMax === includeValue && rawMin < includeValue

  let min = rawMin
  let max = rawMax

  if (max - min < minimumSpan) {
    if (oneSidedPositive) {
      max = min + minimumSpan
    } else if (oneSidedNegative) {
      min = max - minimumSpan
    } else {
      ;({ min, max } = ensureMinimumSpan(min, max, minimumSpan))
    }
  }

  ;({ min, max } = paddedRange(min, max, paddingFraction))

  if (oneSidedPositive) min = includeValue
  if (oneSidedNegative) max = includeValue

  return {
    min: min < 0 ? -niceCeilingMagnitude(-min) : includeValue,
    max: max > 0 ? niceCeilingMagnitude(max) : includeValue,
  }
}

export function selectLagrangeAnchor(values: number[]): LagrangeAnchorDegrees {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const containsMinus = min <= -60 && max >= -60
  const containsPlus = min <= 60 && max >= 60

  if (containsPlus && !containsMinus) return 60
  if (containsMinus && !containsPlus) return -60

  const meanDistance = (anchor: LagrangeAnchorDegrees) =>
    values.reduce((sum, value) => sum + Math.abs(value - anchor), 0) / Math.max(values.length, 1)

  return meanDistance(60) <= meanDistance(-60) ? 60 : -60
}

export function closeUpPhiRange(
  values: number[],
  anchor = selectLagrangeAnchor(values),
  minimumSpan = 20,
  paddingFraction = DEFAULT_PADDING_FRACTION,
): PlotRange {
  let min = Math.min(anchor, ...values)
  let max = Math.max(anchor, ...values)
  ;({ min, max } = ensureMinimumSpan(min, max, minimumSpan))
  ;({ min, max } = paddedRange(min, max, paddingFraction))

  min = Math.floor(min / CLOSE_UP_ANGLE_STEP) * CLOSE_UP_ANGLE_STEP
  max = Math.ceil(max / CLOSE_UP_ANGLE_STEP) * CLOSE_UP_ANGLE_STEP
  min = Math.max(-180, min)
  max = Math.min(180, max)

  if (max - min < minimumSpan) {
    if (min <= -180) {
      max = Math.min(180, min + minimumSpan)
    } else if (max >= 180) {
      min = Math.max(-180, max - minimumSpan)
    } else {
      const center = (min + max) / 2
      min = Math.max(-180, center - minimumSpan / 2)
      max = Math.min(180, center + minimumSpan / 2)
    }
  }

  if (anchor < min) min = anchor
  if (anchor > max) max = anchor

  return { min, max }
}

export function anchoredTicks(
  range: PlotRange,
  anchor: number,
  targetIntervals = 5,
): number[] {
  const span = range.max - range.min
  const step = niceCeilingMagnitude(span / Math.max(targetIntervals, 1))
  if (!(step > 0)) return [anchor]

  const epsilon = step * 1e-10
  const firstIndex = Math.ceil((range.min - anchor - epsilon) / step)
  const lastIndex = Math.floor((range.max - anchor + epsilon) / step)
  const ticks: number[] = []

  for (let index = firstIndex; index <= lastIndex; index += 1) {
    const tick = anchor + index * step
    ticks.push(Number(tick.toPrecision(12)))
  }

  return ticks
}

export function isLagrangeLongitude(value: number): value is LagrangeAnchorDegrees {
  return LAGRANGE_LONGITUDES.includes(value as LagrangeAnchorDegrees)
}
