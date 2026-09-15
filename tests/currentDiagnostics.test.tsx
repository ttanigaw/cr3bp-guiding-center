import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

it('updates current diagnostics with the shared animation time and resets them', async () => {
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

    const diagnostic = (key: string) =>
      container.querySelector<HTMLElement>(`[data-diagnostic="${key}"]`)?.textContent
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    const findButton = (label: string) => buttons.find((button) => button.textContent === label)

    expect(container.textContent).toContain('Current state')
    expect(container.textContent).toContain('Numerical conservation')
    expect(container.textContent).toContain('Approximation validity')
    expect(container.textContent).toContain('Whole trajectory')
    expect(diagnostic('current-t')).toBe('0.000')
    expect(diagnostic('current-dhgc')).toBe('0')

    const initialR = diagnostic('current-r')
    const initialR2 = diagnostic('current-r2')
    const initialHGc = diagnostic('current-hgc')

    await act(async () => findButton('Play')?.click())
    const firstFrame = runScheduledFrame
    if (firstFrame) await act(async () => firstFrame(0))
    const secondFrame = runScheduledFrame
    if (secondFrame) await act(async () => secondFrame(500))

    expect(diagnostic('current-t')).not.toBe('0.000')
    expect(diagnostic('current-r')).not.toBe(initialR)
    expect(diagnostic('current-r2')).not.toBe(initialR2)
    expect(diagnostic('current-hgc')).not.toBeUndefined()
    expect(diagnostic('current-hgc')).not.toBe('')
    expect(initialHGc).not.toBeUndefined()
    expect(diagnostic('current-epsilon')).not.toBeUndefined()
    expect(diagnostic('current-radial-rate')).not.toBeUndefined()

    await act(async () => findButton('Reset')?.click())
    expect(diagnostic('current-t')).toBe('0.000')
    expect(diagnostic('current-r')).toBe(initialR)
    expect(diagnostic('current-r2')).toBe(initialR2)
    expect(diagnostic('current-dhgc')).toBe('0')
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  }
})
