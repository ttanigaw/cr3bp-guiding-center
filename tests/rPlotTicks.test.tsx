import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import StatePlots from '../src/components/StatePlots'
import type { TrajectoryPoint } from '../src/physics/integrator'

it('anchors r(t) ticks to r = 1 with equal nice spacing', async () => {
  const trajectory: TrajectoryPoint[] = [
    { t: 0, r: 1, phi: 0 },
    { t: 1, r: 1.018, phi: 0.1 },
    { t: 2, r: 0.982, phi: 0.2 },
    { t: 3, r: 1.006, phi: 0.3 },
  ]
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(
      <StatePlots
        trajectory={trajectory}
        currentPoint={trajectory[0]}
        mu={0.001}
        showLagrangePoints
      />,
    ))

    const radialPlot = container.querySelector<SVGSVGElement>('.r-time-plot')
    expect(radialPlot?.getAttribute('data-y-min')).toBe('0.98')
    expect(radialPlot?.getAttribute('data-y-max')).toBe('1.02')

    const labels = Array.from(radialPlot?.querySelectorAll<SVGTextElement>('.state-y-tick-label') ?? [])
      .map((label) => label.textContent)
    expect(labels).toEqual(['0.98', '0.99', '1.00', '1.01', '1.02'])

    const referenceLine = radialPlot?.querySelector('.state-reference-line')
    expect(referenceLine).not.toBeNull()
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})
