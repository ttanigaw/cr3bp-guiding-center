import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import StatePlots from '../src/components/StatePlots'
import type { TrajectoryPoint } from '../src/physics/integrator'
import { zeroBasedNiceAxis } from '../src/visualization/plotScale'

it('rounds the time-axis maximum outward to a nice tick', () => {
  expect(zeroBasedNiceAxis(230)).toEqual({
    range: { min: 0, max: 250 },
    ticks: [0, 50, 100, 150, 200, 250],
    step: 50,
  })

  expect(zeroBasedNiceAxis(250)).toEqual({
    range: { min: 0, max: 250 },
    ticks: [0, 50, 100, 150, 200, 250],
    step: 50,
  })
})

it('uses the same nice time ticks for r(t) and phi(t)', async () => {
  const trajectory: TrajectoryPoint[] = [
    { t: 0, r: 1, phi: 0 },
    { t: 80, r: 1.01, phi: 0.2 },
    { t: 160, r: 0.99, phi: 0.4 },
    { t: 230, r: 1.005, phi: 0.6 },
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

    const expectedLabels = ['0', '50', '100', '150', '200', '250']
    for (const selector of ['.r-time-plot', '.phi-time-plot']) {
      const plot = container.querySelector<SVGSVGElement>(selector)
      expect(plot?.getAttribute('data-x-min')).toBe('0')
      expect(plot?.getAttribute('data-x-max')).toBe('250')
      const labels = Array.from(plot?.querySelectorAll<SVGTextElement>('.state-x-tick-label') ?? [])
        .map((label) => label.textContent)
      expect(labels).toEqual(expectedLabels)
    }
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})
