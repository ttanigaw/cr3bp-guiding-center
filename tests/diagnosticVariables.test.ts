import { describe, expect, it } from 'vitest'
import { trajectoryDiagnosticData } from '../src/diagnostics/diagnosticData'
import {
  diagnosticVariableByKey,
  diagnosticVariables,
  splitDiagnosticSegments,
} from '../src/diagnostics/diagnosticVariables'
import { integrateGuidingCenter } from '../src/physics/integrator'

describe('diagnostic variable registry', () => {
  it('contains the planned version-0.1 custom-plot variables', () => {
    expect(diagnosticVariables.map((definition) => definition.key)).toEqual([
      't',
      'r',
      'rOffset',
      'phiWrapped',
      'r2',
      'epsilonTide',
      'hGc',
      'deltaHGc',
      'absDeltaHGc',
      'rDot',
      'phiDot',
      'absRadialRate',
    ])
    expect(diagnosticVariableByKey.deltaHGc.referenceValue).toBe(0)
    expect(diagnosticVariableByKey.r.referenceValue).toBe(1)
  })

  it('splits custom-plot paths only when wrapped phi crosses its discontinuity', () => {
    const samples = [
      { t: 0, phiDegreesWrapped: 170 },
      { t: 1, phiDegreesWrapped: 179 },
      { t: 2, phiDegreesWrapped: -179 },
      { t: 3, phiDegreesWrapped: -170 },
    ].map((point) => ({
      ...point,
      binaryPeriods: 0,
      r: 1,
      rOffset: 0,
      phi: 0,
      r2: 1,
      epsilonTide: 0,
      hGc: 0,
      deltaHGc: 0,
      absDeltaHGc: 0,
      rDot: 0,
      phiDot: 0,
      absRadialRate: 0,
    }))

    expect(splitDiagnosticSegments(samples, 't', 'r')).toHaveLength(1)
    expect(splitDiagnosticSegments(samples, 'phiWrapped', 'r')).toHaveLength(2)
    expect(splitDiagnosticSegments(samples, 'r', 'phiWrapped')).toHaveLength(2)
  })

  it('maps real trajectory diagnostic data through the registry without changing the trajectory', () => {
    const trajectory = integrateGuidingCenter(
      { r: 1, phi: (80 * Math.PI) / 180 },
      0.001,
      { dt: 0.05, tMax: 2 },
    )
    const originalFirst = { ...trajectory[0] }
    const samples = trajectoryDiagnosticData(trajectory, 0.001)

    expect(diagnosticVariableByKey.t.value(samples[0])).toBe(0)
    expect(diagnosticVariableByKey.deltaHGc.value(samples[0])).toBe(0)
    expect(diagnosticVariableByKey.r2.value(samples[0])).toBeGreaterThan(0)
    expect(trajectory[0]).toEqual(originalFirst)
  })
})
