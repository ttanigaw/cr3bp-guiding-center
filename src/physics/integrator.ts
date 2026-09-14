import {
  guidingCenterRates,
  type GuidingCenterRates,
  type GuidingCenterState,
} from './guidingCenter'

export interface IntegrationOptions {
  dt: number
  tMax: number
  maxSteps?: number
}

export interface TrajectoryPoint extends GuidingCenterState {
  t: number
}

const DEFAULT_MAX_STEPS = 1_000_000

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite`)
  }
}

function validateIntegrationOptions(options: IntegrationOptions): number {
  const { dt, tMax, maxSteps = DEFAULT_MAX_STEPS } = options

  assertFinite(dt, 'dt')
  assertFinite(tMax, 'tMax')

  if (dt <= 0) {
    throw new RangeError('dt must be positive')
  }

  if (tMax < 0) {
    throw new RangeError('tMax must be non-negative')
  }

  if (!Number.isInteger(maxSteps) || maxSteps <= 0) {
    throw new RangeError('maxSteps must be a positive integer')
  }

  return maxSteps
}

function assertFiniteRates(rates: GuidingCenterRates): void {
  if (!Number.isFinite(rates.drdt) || !Number.isFinite(rates.dphidt)) {
    throw new RangeError('guiding-center derivative became non-finite')
  }
}

function offsetState(
  state: GuidingCenterState,
  rates: GuidingCenterRates,
  scale: number,
): GuidingCenterState {
  return {
    r: state.r + scale * rates.drdt,
    phi: state.phi + scale * rates.dphidt,
  }
}

/**
 * Advance one step of the reduced guiding-center equations with classical RK4.
 */
export function rk4Step(
  state: GuidingCenterState,
  mu: number,
  dt: number,
): GuidingCenterState {
  assertFinite(dt, 'dt')
  if (dt <= 0) {
    throw new RangeError('dt must be positive')
  }

  const k1 = guidingCenterRates(state, mu)
  assertFiniteRates(k1)

  const k2 = guidingCenterRates(offsetState(state, k1, dt / 2), mu)
  assertFiniteRates(k2)

  const k3 = guidingCenterRates(offsetState(state, k2, dt / 2), mu)
  assertFiniteRates(k3)

  const k4 = guidingCenterRates(offsetState(state, k3, dt), mu)
  assertFiniteRates(k4)

  const nextState = {
    r: state.r + (dt / 6) * (k1.drdt + 2 * k2.drdt + 2 * k3.drdt + k4.drdt),
    phi:
      state.phi +
      (dt / 6) * (k1.dphidt + 2 * k2.dphidt + 2 * k3.dphidt + k4.dphidt),
  }

  if (!Number.isFinite(nextState.r) || !Number.isFinite(nextState.phi)) {
    throw new RangeError('RK4 state became non-finite')
  }

  if (nextState.r <= 0) {
    throw new RangeError('RK4 state reached non-positive r')
  }

  return nextState
}

/**
 * Integrate the reduced guiding-center equations from t=0 to t=tMax.
 *
 * The requested dt is used for all full steps. If tMax is not an integer
 * multiple of dt, the final step is shortened so the last sample is exactly
 * at tMax.
 */
export function integrateGuidingCenter(
  initialState: GuidingCenterState,
  mu: number,
  options: IntegrationOptions,
): TrajectoryPoint[] {
  const maxSteps = validateIntegrationOptions(options)
  const { dt, tMax } = options

  // Validate the initial state and mass ratio through the physics implementation.
  const initialRates = guidingCenterRates(initialState, mu)
  assertFiniteRates(initialRates)

  const requiredSteps = Math.ceil(tMax / dt)
  if (requiredSteps > maxSteps) {
    throw new RangeError(
      `integration requires ${requiredSteps} steps, exceeding maxSteps=${maxSteps}`,
    )
  }

  const trajectory: TrajectoryPoint[] = [
    { t: 0, r: initialState.r, phi: initialState.phi },
  ]

  if (tMax === 0) {
    return trajectory
  }

  let state = { ...initialState }
  let t = 0

  for (let stepIndex = 0; stepIndex < requiredSteps; stepIndex += 1) {
    const targetTime =
      stepIndex === requiredSteps - 1 ? tMax : Math.min(tMax, (stepIndex + 1) * dt)
    const stepSize = targetTime - t

    if (stepSize <= 0) {
      continue
    }

    state = rk4Step(state, mu, stepSize)
    t = targetTime
    trajectory.push({ t, r: state.r, phi: state.phi })
  }

  return trajectory
}
