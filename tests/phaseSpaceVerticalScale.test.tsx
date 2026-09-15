import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

function yTickValues(plot: SVGSVGElement | null): number[] {
  return Array.from(plot?.querySelectorAll<SVGTextElement>('.state-y-tick-label') ?? [])
    .map((label) => Number(label.textContent))
}

it('anchors phase-space vertical ticks to zero for Full width Magnify', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(<App />))

    const phasePlot = container.querySelector<SVGSVGElement>('.phase-space-plot')
    const ticks = yTickValues(phasePlot)
    expect(ticks).toContain(0)

    const differences = ticks.slice(1).map((value, index) => value - ticks[index])
    for (const difference of differences.slice(1)) {
      expect(difference).toBeCloseTo(differences[0], 10)
    }
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})

it('shows only upper and lower vertical values for a very shallow Full-width 1:1 phase plot', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(<App />))

    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    const oneToOne = buttons.find((button) => button.textContent === '1:1 scale')
    await act(async () => oneToOne?.click())

    const phasePlot = container.querySelector<SVGSVGElement>('.phase-space-plot')
    const ticks = yTickValues(phasePlot)
    expect(ticks).toHaveLength(2)
    expect(ticks).not.toContain(0)

    const referenceLine = Array.from(phasePlot?.querySelectorAll<SVGLineElement>('.state-reference-line') ?? [])
      .some((line) => line.getAttribute('x1') === '58' && line.getAttribute('x2') === '622')
    expect(referenceLine).toBe(true)
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})
