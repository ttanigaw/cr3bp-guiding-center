import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

it('renders the default horseshoe trajectory and switches presets', async () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

  try {
    await act(async () => root.render(<App />))

    expect(container.querySelector('main h1')?.textContent).toBe(
      'CR3BP Guiding-Center Visualizer',
    )
    expect(container.textContent).toContain('Validated presets')
    expect(container.textContent).toContain('Binary periods')
    expect(container.querySelector('.trajectory-path')).not.toBeNull()
    expect(container.querySelector('.primary-body')).not.toBeNull()
    expect(container.querySelector('.secondary-body')).not.toBeNull()
    expect(container.querySelectorAll('.lagrange-point')).toHaveLength(2)

    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.preset-button'))
    const l4Button = buttons.find((button) => button.textContent?.includes('L4 tadpole'))

    expect(l4Button).toBeDefined()

    await act(async () => l4Button?.click())

    expect(l4Button?.getAttribute('aria-pressed')).toBe('true')
    expect(container.textContent).toContain('80°')
    expect(container.textContent).toContain('25.5')
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
  }
})
