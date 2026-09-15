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
