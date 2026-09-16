import type { DiagnosticSample } from './diagnosticData'

export type DiagnosticVariableKey =
  | 't'
  | 'r'
  | 'rOffset'
  | 'phiWrapped'
  | 'r2'
  | 'epsilonTide'
  | 'hGc'
  | 'deltaHGc'
  | 'absDeltaHGc'
  | 'rDot'
  | 'phiDot'
  | 'absRadialRate'

export interface DiagnosticVariableDefinition {
  key: DiagnosticVariableKey
  label: string
  axisLabel: string
  value: (sample: DiagnosticSample) => number
  formatTick: (value: number) => string
  referenceValue?: number
  fallbackSpan: number
  wrappedAngle?: boolean
}

function adaptiveTick(value: number): string {
  const magnitude = Math.abs(value)
  if (magnitude === 0) return '0'
  if (magnitude >= 100) return value.toFixed(0)
  if (magnitude >= 10) return value.toFixed(1)
  if (magnitude >= 1) return value.toFixed(2)
  if (magnitude >= 0.01) return value.toFixed(3)
  if (magnitude >= 0.001) return value.toFixed(4)
  return value.toExponential(2)
}

function degreeTick(value: number): string {
  return Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1)
}

export const diagnosticVariables: readonly DiagnosticVariableDefinition[] = [
  { key: 't', label: 't', axisLabel: 't', value: (sample) => sample.t, formatTick: adaptiveTick, referenceValue: 0, fallbackSpan: 1e-3 },
  { key: 'r', label: 'r', axisLabel: 'r', value: (sample) => sample.r, formatTick: adaptiveTick, referenceValue: 1, fallbackSpan: 0.002 },
  { key: 'rOffset', label: 'r − 1', axisLabel: 'r − 1', value: (sample) => sample.rOffset, formatTick: adaptiveTick, referenceValue: 0, fallbackSpan: 0.002 },
  { key: 'phiWrapped', label: 'φ [deg]', axisLabel: 'φ [deg]', value: (sample) => sample.phiDegreesWrapped, formatTick: degreeTick, fallbackSpan: 10, wrappedAngle: true },
  { key: 'r2', label: 'r₂', axisLabel: 'r₂', value: (sample) => sample.r2, formatTick: adaptiveTick, fallbackSpan: 0.005 },
  { key: 'epsilonTide', label: 'ε_tide', axisLabel: 'ε_tide', value: (sample) => sample.epsilonTide, formatTick: adaptiveTick, fallbackSpan: 1e-6 },
  { key: 'hGc', label: 'H_gc', axisLabel: 'H_gc', value: (sample) => sample.hGc, formatTick: adaptiveTick, fallbackSpan: 1e-8 },
  { key: 'deltaHGc', label: 'ΔH_gc', axisLabel: 'ΔH_gc', value: (sample) => sample.deltaHGc, formatTick: adaptiveTick, referenceValue: 0, fallbackSpan: 1e-13 },
  { key: 'absDeltaHGc', label: '|ΔH_gc|', axisLabel: '|ΔH_gc|', value: (sample) => sample.absDeltaHGc, formatTick: adaptiveTick, referenceValue: 0, fallbackSpan: 1e-13 },
  { key: 'rDot', label: 'ṙ', axisLabel: 'ṙ', value: (sample) => sample.rDot, formatTick: adaptiveTick, referenceValue: 0, fallbackSpan: 1e-6 },
  { key: 'phiDot', label: 'φ̇', axisLabel: 'φ̇', value: (sample) => sample.phiDot, formatTick: adaptiveTick, referenceValue: 0, fallbackSpan: 1e-6 },
  { key: 'absRadialRate', label: '|ṙ / r|', axisLabel: '|ṙ / r|', value: (sample) => sample.absRadialRate, formatTick: adaptiveTick, referenceValue: 0, fallbackSpan: 1e-6 },
] as const

export const diagnosticVariableByKey = Object.fromEntries(
  diagnosticVariables.map((definition) => [definition.key, definition]),
) as Record<DiagnosticVariableKey, DiagnosticVariableDefinition>

export function splitDiagnosticSegments(
  samples: readonly DiagnosticSample[],
  xKey: DiagnosticVariableKey,
  yKey: DiagnosticVariableKey,
): DiagnosticSample[][] {
  if (samples.length === 0) return []

  const splitAtPhiWrap =
    diagnosticVariableByKey[xKey].wrappedAngle === true ||
    diagnosticVariableByKey[yKey].wrappedAngle === true

  if (!splitAtPhiWrap) return [Array.from(samples)]

  const segments: DiagnosticSample[][] = []
  let current: DiagnosticSample[] = []
  let previousPhi: number | null = null

  for (const sample of samples) {
    if (previousPhi !== null && Math.abs(sample.phiDegreesWrapped - previousPhi) > 180) {
      if (current.length > 0) segments.push(current)
      current = []
    }
    current.push(sample)
    previousPhi = sample.phiDegreesWrapped
  }

  if (current.length > 0) segments.push(current)
  return segments
}
