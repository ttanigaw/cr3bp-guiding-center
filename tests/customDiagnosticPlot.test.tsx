import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

function setSelectValue(select: HTMLSelectElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
  setter?.call(select, value)
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

function numericTickValues(
  root: SVGSVGElement | null | undefined,
  selector: string,
): number[] {
  return Array.from(root?.querySelectorAll<SVGTextElement>(selector) ?? [])
    .map((label) => Number(label.textContent))
    .filter((value) => Number.isFinite(value))
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
    const xScale = container.querySelector<HTMLSelectElement>('select[aria-label="Custom plot X scale"]')
    const yScale = container.querySelector<HTMLSelectElement>('select[aria-label="Custom plot Y scale"]')
    const integrationPointCount = () => container.querySelectorAll<HTMLElement>('.diagnostics-grid-summary dd')[2]?.textContent

    expect(xSelect?.value).toBe('t')
    expect(ySelect?.value).toBe('deltaHGc')
    expect(xScale?.value).toBe('linear')
    expect(yScale?.value).toBe('linear')
    expect(xScale?.querySelector<HTMLOptionElement>('option[value="log10"]')?.disabled).toBe(true)
    expect(yScale?.querySelector<HTMLOptionElement>('option[value="log10"]')?.disabled).toBe(true)
    expect(plot()?.getAttribute('data-x-variable')).toBe('t')
    expect(plot()?.getAttribute('data-y-variable')).toBe('deltaHGc')
    expect(plot()?.getAttribute('data-x-scale')).toBe('linear')
    expect(plot()?.getAttribute('data-y-scale')).toBe('linear')
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
    expect(yScale?.querySelector<HTMLOptionElement>('option[value="log10"]')?.disabled).toBe(false)

    await act(async () => {
      if (yScale) setSelectValue(yScale, 'log10')
    })
    expect(plot()?.getAttribute('data-y-scale')).toBe('log10')
    expect(plot()?.querySelector('.custom-y-axis-title')?.textContent).toBe('log10(r₂)')

    await act(async () => {
      if (ySelect) setSelectValue(ySelect, 'rDot')
    })
    expect(yScale?.value).toBe('linear')
    expect(plot()?.getAttribute('data-y-scale')).toBe('linear')
    expect(yScale?.querySelector<HTMLOptionElement>('option[value="log10"]')?.disabled).toBe(true)

    await act(async () => {
      if (xSelect) setSelectValue(xSelect, 'rDot')
      if (ySelect) setSelectValue(ySelect, 'phiDot')
    })
    const xTickValues = numericTickValues(plot(), '.custom-x-tick-label')
    const yTickValues = numericTickValues(plot(), '.custom-y-tick-label')
    expect(xTickValues).toContain(0)
    expect(yTickValues).toContain(0)

    const xDifferences = xTickValues.slice(1).map((value, index) => value - xTickValues[index])
    for (const difference of xDifferences.slice(1)) {
      expect(difference).toBeCloseTo(xDifferences[0], 10)
    }
    const yDifferences = yTickValues.slice(1).map((value, index) => value - yTickValues[index])
    for (const difference of yDifferences.slice(1)) {
      expect(difference).toBeCloseTo(yDifferences[0], 10)
    }

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
