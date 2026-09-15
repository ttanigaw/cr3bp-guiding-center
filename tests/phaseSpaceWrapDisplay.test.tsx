import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

function xTickLabels(plot: SVGSVGElement | null): Array<string | null> {
  return Array.from(plot?.querySelectorAll<SVGTextElement>('.state-x-tick-label') ?? [])
    .map((label) => label.textContent)
}

it('falls both close-up modes back to Full width across the wrap and shows both visible Lagrange points', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(<App />))

    const buttons = () => Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    const findButton = (label: string) => buttons().find((button) => button.textContent === label)
    const phasePlot = () => container.querySelector<SVGSVGElement>('.phase-space-plot')

    expect(phasePlot()?.querySelectorAll('.phase-secondary-point')).toHaveLength(1)
    expect(phasePlot()?.querySelectorAll('.phase-lagrange-point')).toHaveLength(2)

    for (const mode of ['Close-up with origin', 'Close-up']) {
      await act(async () => findButton(mode)?.click())

      expect(phasePlot()?.getAttribute('data-x-min')).toBe('-180')
      expect(phasePlot()?.getAttribute('data-x-max')).toBe('180')
      expect(xTickLabels(phasePlot())).toEqual(['-180', '-90', '0', '90', '180'])
      expect(phasePlot()?.querySelectorAll('.phase-secondary-point')).toHaveLength(1)
      expect(phasePlot()?.querySelectorAll('.phase-lagrange-point')).toHaveLength(2)
    }
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})

it('keeps phi zero and the secondary visible in an L4 Close-up with origin', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(<App />))

    const buttons = () => Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    const findButton = (label: string) => buttons().find((button) => button.textContent === label)
    const l4PresetButton = Array.from(container.querySelectorAll<HTMLButtonElement>('.preset-button'))
      .find((button) => button.textContent?.includes('L4 tadpole'))

    await act(async () => l4PresetButton?.click())
    await act(async () => findButton('Calculate')?.click())
    await act(async () => findButton('Close-up with origin')?.click())

    const phasePlot = container.querySelector<SVGSVGElement>('.phase-space-plot')
    const xMin = Number(phasePlot?.getAttribute('data-x-min'))
    const xMax = Number(phasePlot?.getAttribute('data-x-max'))
    expect(xMin).toBeLessThanOrEqual(0)
    expect(xMax).toBeGreaterThanOrEqual(60)
    expect(xMax - xMin).toBeLessThan(360)

    expect(xTickLabels(phasePlot)).toContain('0')
    expect(xTickLabels(phasePlot)).toContain('60')
    expect(phasePlot?.querySelectorAll('.phase-secondary-point')).toHaveLength(1)
    expect(phasePlot?.querySelectorAll('.phase-lagrange-point')).toHaveLength(1)
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})

it('allows an L4 Close-up to omit phi zero and the secondary', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(<App />))

    const buttons = () => Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    const findButton = (label: string) => buttons().find((button) => button.textContent === label)
    const l4PresetButton = Array.from(container.querySelectorAll<HTMLButtonElement>('.preset-button'))
      .find((button) => button.textContent?.includes('L4 tadpole'))

    await act(async () => l4PresetButton?.click())
    await act(async () => findButton('Calculate')?.click())
    await act(async () => findButton('Close-up')?.click())

    const phasePlot = container.querySelector<SVGSVGElement>('.phase-space-plot')
    const xMin = Number(phasePlot?.getAttribute('data-x-min'))
    const xMax = Number(phasePlot?.getAttribute('data-x-max'))
    expect(xMin).toBeGreaterThan(0)
    expect(xMax).toBeGreaterThanOrEqual(60)
    expect(xMax - xMin).toBeLessThan(360)

    expect(xTickLabels(phasePlot)).not.toContain('0')
    expect(xTickLabels(phasePlot)).toContain('60')
    expect(phasePlot?.querySelectorAll('.phase-secondary-point')).toHaveLength(0)
    expect(phasePlot?.querySelectorAll('.phase-lagrange-point')).toHaveLength(1)
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})
