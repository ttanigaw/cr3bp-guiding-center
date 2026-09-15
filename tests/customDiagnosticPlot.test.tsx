import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

function setSelectValue(select: HTMLSelectElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
  setter?.call(select, value)
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

it('renders selectable custom diagnostic axes and keeps the marker synchronized to playback', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  let runScheduledFrame: ((timestamp: number) => void) | undefined
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    runScheduledFrame = (timestamp: number) => callback(timestamp)
    return 1
  }
  globalThis.cancelAnimationFrame = () => {
    runScheduledFrame = undefined
  }

  try {
    await act(async () => root.render(<App />))

    const plot = () => container.querySelector<SVGSVGElement>('.custom-diagnostic-plot')
    const xSelect = container.querySelector<HTMLSelectElement>('select[aria-label="Custom plot X axis"]')
    const ySelect = container.querySelector<HTMLSelectElement>('select[aria-label="Custom plot Y axis"]')
    const integrationPointCount = () => container.querySelectorAll<HTMLElement>('.diagnostics-grid-summary dd')[2]?.textContent

    expect(xSelect?.value).toBe('t')
    expect(ySelect?.value).toBe('deltaHGc')
    expect(plot()?.getAttribute('data-x-variable')).toBe('t')
    expect(plot()?.getAttribute('data-y-variable')).toBe('deltaHGc')
    expect(container.textContent).toContain('Custom X–Y plot')
    expect(container.textContent).toContain('ΔH_gc')

    const initialIntegrationPoints = integrationPointCount()
    const initialPath = container.querySelector<SVGPathElement>('.custom-diagnostic-path')?.getAttribute('d')

    await act(async () => {
      if (ySelect) setSelectValue(ySelect, 'r2')
    })
    expect(plot()?.getAttribute('data-y-variable')).toBe('r2')
    expect(container.querySelector<SVGPathElement>('.custom-diagnostic-path')?.getAttribute('d')).not.toBe(initialPath)
    expect(integrationPointCount()).toBe(initialIntegrationPoints)

    await act(async () => {
      if (xSelect) setSelectValue(xSelect, 'phiWrapped')
    })
    expect(plot()?.getAttribute('data-x-variable')).toBe('phiWrapped')
    expect(container.querySelectorAll('.custom-diagnostic-path').length).toBeGreaterThan(1)
    expect(container.textContent).toContain('Wrapped φ discontinuities are not connected.')
    expect(integrationPointCount()).toBe(initialIntegrationPoints)

    const marker = () => container.querySelector<SVGCircleElement>('.custom-diagnostic-current-marker')
    const initialMarkerPosition = [marker()?.getAttribute('cx'), marker()?.getAttribute('cy')]
    const playButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Play')

    await act(async () => playButton?.click())
    const firstFrame = runScheduledFrame
    if (firstFrame) await act(async () => firstFrame(0))
    const secondFrame = runScheduledFrame
    if (secondFrame) await act(async () => secondFrame(500))

    const advancedMarkerPosition = [marker()?.getAttribute('cx'), marker()?.getAttribute('cy')]
    expect(advancedMarkerPosition).not.toEqual(initialMarkerPosition)
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  }
})
