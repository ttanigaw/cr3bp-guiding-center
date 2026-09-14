import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

it('renders controls, recalculates explicitly, and reports diagnostics', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(<App />))

    expect(container.querySelector('main h1')?.textContent).toBe(
      'CR3BP Guiding-Center Visualizer',
    )
    expect(container.textContent).toContain('Calculate an orbit')
    expect(container.textContent).toContain('Diagnostics')
    expect(container.textContent).toContain('Max |ΔH|')
    expect(container.textContent).toContain('Min secondary distance')
    expect(container.querySelector('.trajectory-path')).not.toBeNull()

    const tMaxInput = container.querySelector<HTMLInputElement>('input[name="tMax"]')
    const calculateButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Calculate')

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
  }
})
