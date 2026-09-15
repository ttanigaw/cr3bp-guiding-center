import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

it('renders both frame views, shares playback controls, recalculates explicitly, and reports diagnostics', async () => {
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

    expect(container.querySelector('main h1')?.textContent).toBe(
      'CR3BP Guiding-Center Visualizer',
    )
    expect(container.textContent).toContain('Calculate an orbit')
    expect(container.textContent).toContain('Rotating frame')
    expect(container.textContent).toContain('Inertial frame')
    expect(container.textContent).toContain('θ = φ + t')
    expect(container.textContent).toContain('Playback')
    expect(container.textContent).toContain('3 afterimages + fading 4/12-period trail')
    expect(container.textContent).toContain('Diagnostics')
    expect(container.textContent).toContain('Max |ΔH|')
    expect(container.textContent).toContain('Min secondary distance')
    expect(container.querySelector('.trajectory-path')).not.toBeNull()
    expect(container.querySelectorAll('.digital-number')).toHaveLength(2)
    expect(container.querySelectorAll('.current-position')).toHaveLength(2)
    expect(container.querySelectorAll('.trajectory-card')).toHaveLength(2)
    expect(container.querySelectorAll('.lagrange-geometry')).toHaveLength(4)
    expect(container.querySelectorAll('.axis-label')).toHaveLength(4)
    expect(container.querySelectorAll('.afterimage')).toHaveLength(0)
    expect(container.querySelectorAll('.afterimage-trail-segment')).toHaveLength(0)

    const buttons = () => Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    const findButton = (label: string) => buttons().find((button) => button.textContent === label)

    await act(async () => findButton('Play')?.click())
    expect(container.textContent).toContain('playing')

    const firstFrame = runScheduledFrame
    if (firstFrame) {
      await act(async () => firstFrame(0))
    }
    const secondFrame = runScheduledFrame
    if (secondFrame) {
      await act(async () => secondFrame(500))
    }
    expect(container.textContent).toContain('0.50 binary periods')
    expect(container.querySelectorAll('.afterimage')).toHaveLength(6)
    expect(container.querySelectorAll('.afterimage-trail-segment').length).toBeGreaterThan(0)

    await act(async () => findButton('Pause')?.click())
    expect(container.textContent).toContain('paused')

    await act(async () => findButton('Reset')?.click())
    expect(container.textContent).toContain('0.00 binary periods')
    expect(container.querySelectorAll('.afterimage')).toHaveLength(0)
    expect(container.querySelectorAll('.afterimage-trail-segment')).toHaveLength(0)

    const tMaxInput = container.querySelector<HTMLInputElement>('input[name="tMax"]')
    const calculateButton = findButton('Calculate')

    expect(tMaxInput).not.toBeNull()
    expect(calculateButton).toBeDefined()

    await act(async () => {
      if (tMaxInput) {
        const setter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          'value',
        )?.set
        setter?.call(tMaxInput, '10')
        tMaxInput.dispatchEvent(new Event('input', { bubbles: true }))
        tMaxInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    expect(container.textContent).toContain('39.8')

    await act(async () => calculateButton?.click())

    expect(container.textContent).toContain('1.6')
    expect(container.textContent).toContain('201')
    expect(container.textContent).toContain('0.00 binary periods')

    const muInput = container.querySelector<HTMLInputElement>('input[name="mu"]')
    await act(async () => {
      if (muInput) {
        const setter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          'value',
        )?.set
        setter?.call(muInput, '0.9')
        muInput.dispatchEvent(new Event('input', { bubbles: true }))
        muInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await act(async () => calculateButton?.click())

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      '0 ≤ μ ≤ 0.5',
    )
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  }
})
