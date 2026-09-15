import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

it('uses full-width ticks for wrapped close-up trajectories and shows the secondary in phase space', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(<App />))

    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    const closeUpButton = buttons.find((button) => button.textContent === 'Close-up')
    const phasePlot = () => container.querySelector<SVGSVGElement>('.phase-space-plot')

    expect(container.querySelectorAll('.phase-secondary-point')).toHaveLength(1)
    expect(container.querySelector('.phase-secondary-point')?.classList.contains('secondary-body')).toBe(true)

    await act(async () => closeUpButton?.click())

    expect(phasePlot()?.getAttribute('data-x-min')).toBe('-180')
    expect(phasePlot()?.getAttribute('data-x-max')).toBe('180')

    const xTickLabels = Array.from(
      phasePlot()?.querySelectorAll<SVGTextElement>('.state-x-tick-label') ?? [],
    ).map((label) => label.textContent)

    expect(xTickLabels).toContain('0')
    expect(xTickLabels).toEqual(['-180', '-90', '0', '90', '180'])
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})

it('keeps phi zero and the secondary visible in an L4 close-up', async () => {
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
    expect(xMin).toBeLessThanOrEqual(0)
    expect(xMax).toBeGreaterThanOrEqual(60)
    expect(xMax - xMin).toBeLessThan(360)

    const xTickLabels = Array.from(
      phasePlot?.querySelectorAll<SVGTextElement>('.state-x-tick-label') ?? [],
    ).map((label) => label.textContent)
    expect(xTickLabels).toContain('0')
    expect(xTickLabels).toContain('60')

    expect(phasePlot?.querySelectorAll('.phase-secondary-point')).toHaveLength(1)
    expect(phasePlot?.querySelectorAll('.phase-lagrange-point')).toHaveLength(1)
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})
