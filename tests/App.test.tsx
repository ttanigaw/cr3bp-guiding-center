import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import App from '../src/App'

it('renders both frame views, synchronized state plots, display controls, explicit recalculation, and diagnostics', async () => {
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

    expect(container.querySelector('main h1')?.textContent).toBe('CR3BP Guiding-Center Visualizer')
    expect(container.textContent).toContain('Display layers')
    expect(container.textContent).toContain('r(t)')
    expect(container.textContent).toContain('φ(t)')
    expect(container.textContent).toContain('φ vs r − 1')
    expect(container.querySelectorAll('.digital-number')).toHaveLength(2)
    expect(container.querySelectorAll('.current-position')).toHaveLength(2)
    expect(container.querySelectorAll('.trajectory-card')).toHaveLength(2)
    expect(container.querySelectorAll('.state-plot')).toHaveLength(3)
    expect(container.querySelectorAll('.state-current-marker')).toHaveLength(3)
    expect(container.querySelectorAll('.state-data-line').length).toBeGreaterThanOrEqual(3)
    expect(container.querySelectorAll('.lagrange-geometry')).toHaveLength(4)
    expect(container.querySelectorAll('.axis-label')).toHaveLength(4)
    expect(container.querySelectorAll('.trajectory-path')).toHaveLength(2)
    expect(container.querySelector('.inertial-rigid-trajectory-path')).not.toBeNull()

    const buttons = () => Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    const findButtons = (label: string) => buttons().filter((button) => button.textContent === label)
    const findButton = (label: string) => findButtons(label)[0]

    expect(findButton('Afterimages')?.getAttribute('aria-pressed')).toBe('true')
    expect(findButton('L4 / L5 points')?.getAttribute('aria-pressed')).toBe('true')
    expect(findButton('L4 / L5 triangles')?.getAttribute('aria-pressed')).toBe('true')
    expect(findButtons('Axes')).toHaveLength(2)
    expect(findButtons('Trajectory')).toHaveLength(2)
    expect(findButtons('Trajectory')[0]?.getAttribute('aria-pressed')).toBe('true')
    expect(findButtons('Trajectory')[1]?.getAttribute('aria-pressed')).toBe('true')

    expect(findButton('Auto fit')?.getAttribute('aria-pressed')).toBe('true')
    expect(findButton('1:1 scale')?.getAttribute('aria-pressed')).toBe('false')
    const phasePlot = () => container.querySelector<SVGSVGElement>('.phase-space-plot')
    const autoViewBox = phasePlot()?.getAttribute('viewBox')
    expect(autoViewBox).toBe('0 0 640 260')

    await act(async () => findButton('1:1 scale')?.click())
    expect(findButton('Auto fit')?.getAttribute('aria-pressed')).toBe('false')
    expect(findButton('1:1 scale')?.getAttribute('aria-pressed')).toBe('true')
    const equalViewBox = phasePlot()?.getAttribute('viewBox')
    expect(equalViewBox).not.toBe(autoViewBox)
    expect(equalViewBox?.split(' ').slice(0, 3)).toEqual(['0', '0', '640'])
    expect(container.textContent).toContain('(r − 1) × 180/π')

    await act(async () => findButton('Auto fit')?.click())
    expect(phasePlot()?.getAttribute('viewBox')).toBe(autoViewBox)

    const initialRigidPath = container.querySelector<SVGPathElement>('.inertial-rigid-trajectory-path')?.getAttribute('d')
    const initialStateMarkerPositions = Array.from(container.querySelectorAll<SVGCircleElement>('.state-current-marker')).map((marker) => [marker.getAttribute('cx'), marker.getAttribute('cy')])

    await act(async () => findButton('Play')?.click())
    const firstFrame = runScheduledFrame
    if (firstFrame) await act(async () => firstFrame(0))
    const secondFrame = runScheduledFrame
    if (secondFrame) await act(async () => secondFrame(500))

    expect(container.textContent).toContain('0.50 binary periods')
    expect(container.querySelectorAll('.afterimage')).toHaveLength(6)
    expect(container.querySelectorAll('.afterimage-trail-segment').length).toBeGreaterThan(0)
    const advancedRigidPath = container.querySelector<SVGPathElement>('.inertial-rigid-trajectory-path')?.getAttribute('d')
    expect(advancedRigidPath).not.toBe(initialRigidPath)
    const advancedStateMarkerPositions = Array.from(container.querySelectorAll<SVGCircleElement>('.state-current-marker')).map((marker) => [marker.getAttribute('cx'), marker.getAttribute('cy')])
    expect(advancedStateMarkerPositions).not.toEqual(initialStateMarkerPositions)

    await act(async () => findButton('Afterimages')?.click())
    expect(container.querySelectorAll('.afterimage')).toHaveLength(0)
    expect(container.querySelectorAll('.afterimage-trail-segment')).toHaveLength(0)
    expect(findButton('Afterimages')?.getAttribute('aria-pressed')).toBe('false')

    await act(async () => findButton('L4 / L5 points')?.click())
    expect(container.querySelectorAll('.lagrange-point')).toHaveLength(0)

    await act(async () => findButton('L4 / L5 triangles')?.click())
    expect(container.querySelectorAll('.lagrange-geometry')).toHaveLength(0)

    const trajectoryButtons = findButtons('Trajectory')
    await act(async () => trajectoryButtons[0]?.click())
    expect(container.querySelectorAll('.trajectory-path')).toHaveLength(1)
    expect(container.querySelector('.inertial-rigid-trajectory-path')).not.toBeNull()
    await act(async () => trajectoryButtons[1]?.click())
    expect(container.querySelectorAll('.trajectory-path')).toHaveLength(0)

    const axesButtons = findButtons('Axes')
    await act(async () => axesButtons[0]?.click())
    expect(container.querySelectorAll('.axis-label')).toHaveLength(2)
    await act(async () => axesButtons[1]?.click())
    expect(container.querySelectorAll('.axis-label')).toHaveLength(0)

    await act(async () => findButton('Pause')?.click())
    expect(container.textContent).toContain('paused')

    await act(async () => findButton('Reset')?.click())
    expect(container.textContent).toContain('0.00 binary periods')

    const legends = Array.from(container.querySelectorAll<HTMLElement>('.plot-legend'))
    for (const legend of legends) {
      const labels = Array.from(legend.querySelectorAll('span')).map((item) => item.textContent)
      expect(labels.slice(0, 3)).toEqual(['Primary', 'Secondary', 'Current position'])
    }

    const tMaxInput = container.querySelector<HTMLInputElement>('input[name="tMax"]')
    const calculateButton = findButton('Calculate')

    await act(async () => {
      if (tMaxInput) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
        setter?.call(tMaxInput, '10')
        tMaxInput.dispatchEvent(new Event('input', { bubbles: true }))
        tMaxInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    await act(async () => calculateButton?.click())
    expect(container.textContent).toContain('1.6')
    expect(container.textContent).toContain('201')
    expect(container.textContent).toContain('0.00 binary periods')
    expect(container.querySelectorAll('.state-plot')).toHaveLength(3)

    const muInput = container.querySelector<HTMLInputElement>('input[name="mu"]')
    await act(async () => {
      if (muInput) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
        setter?.call(muInput, '0.9')
        muInput.dispatchEvent(new Event('input', { bubbles: true }))
        muInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await act(async () => calculateButton?.click())

    expect(container.querySelector('[role="alert"]')?.textContent).toContain('0 ≤ μ ≤ 0.5')
  } finally {
    await act(async () => root.unmount())
    container.remove()
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT')
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  }
})
