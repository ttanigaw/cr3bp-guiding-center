export interface GuidingCenterState {
  r: number
  phi: number
}

export interface GuidingCenterRates {
  drdt: number
  dphidt: number
}

export interface BodyDistances {
  r1: number
  r2: number
}

export interface DisturbingFunctionDerivatives {
  dRdr: number
  dRdPhi: number
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite`)
  }
}

function validateInputs(r: number, phi: number, mu: number): void {
  assertFinite(r, 'r')
  assertFinite(phi, 'phi')
  assertFinite(mu, 'mu')

  if (r <= 0) {
    throw new RangeError('r must be positive')
  }

  if (mu < 0 || mu > 0.5) {
    throw new RangeError('mu must satisfy 0 <= mu <= 0.5')
  }
}

/**
 * Distances to the primary and secondary in the standard barycentric rotating
 * frame. The Cartesian evaluation is algebraically equivalent to the formulas
 * in docs/PHYSICS.md and avoids cancellation near either body.
 */
export function bodyDistances(r: number, phi: number, mu: number): BodyDistances {
  validateInputs(r, phi, mu)

  const x = r * Math.cos(phi)
  const y = r * Math.sin(phi)

  return {
    r1: Math.hypot(x + mu, y),
    r2: Math.hypot(x - (1 - mu), y),
  }
}

function weightedInverseDistance(weight: number, distance: number): number {
  return weight === 0 ? 0 : weight / distance
}

function weightedInverseCube(weight: number, distance: number): number {
  return weight === 0 ? 0 : weight / distance ** 3
}

/**
 * Disturbing function
 * R = (1-mu)/r1 + mu/r2 - 1/r.
 */
export function disturbingFunction(r: number, phi: number, mu: number): number {
  const { r1, r2 } = bodyDistances(r, phi, mu)

  return (
    weightedInverseDistance(1 - mu, r1) +
    weightedInverseDistance(mu, r2) -
    1 / r
  )
}

/**
 * Analytic derivatives of the disturbing function from docs/PHYSICS.md.
 */
export function disturbingFunctionDerivatives(
  r: number,
  phi: number,
  mu: number,
): DisturbingFunctionDerivatives {
  const { r1, r2 } = bodyDistances(r, phi, mu)
  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)

  const dRdPhi =
    mu === 0
      ? 0
      : mu * (1 - mu) * r * sinPhi * (1 / r1 ** 3 - 1 / r2 ** 3)

  const dRdr =
    1 / r ** 2 -
    weightedInverseCube(1 - mu, r1) * (r + mu * cosPhi) -
    weightedInverseCube(mu, r2) * (r - (1 - mu) * cosPhi)

  return { dRdr, dRdPhi }
}

/**
 * Reduced guiding-center equations for (r, phi).
 */
export function guidingCenterRates(
  state: GuidingCenterState,
  mu: number,
): GuidingCenterRates {
  const { r, phi } = state
  const { dRdr, dRdPhi } = disturbingFunctionDerivatives(r, phi, mu)
  const sqrtR = Math.sqrt(r)

  return {
    drdt: 2 * sqrtR * dRdPhi,
    dphidt: r ** (-1.5) - 1 - 2 * sqrtR * dRdr,
  }
}

/**
 * Conserved Hamiltonian of the reduced model.
 */
export function reducedHamiltonian(state: GuidingCenterState, mu: number): number {
  const { r, phi } = state
  validateInputs(r, phi, mu)

  return -1 / (2 * r) - Math.sqrt(r) - disturbingFunction(r, phi, mu)
}

/**
 * Local tidal-strength indicator epsilon_tide = mu / r2^3.
 */
export function tidalParameter(state: GuidingCenterState, mu: number): number {
  const { r2 } = bodyDistances(state.r, state.phi, mu)
  return weightedInverseCube(mu, r2)
}
