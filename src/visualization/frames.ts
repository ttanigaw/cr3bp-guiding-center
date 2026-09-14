export interface CartesianPoint {
  x: number
  y: number
}

export interface FrameState {
  r: number
  phi: number
  t: number
}

export interface BinaryBodyPositions {
  primary: CartesianPoint
  secondary: CartesianPoint
}

export interface CoordinateAxes {
  xPositive: CartesianPoint
  yPositive: CartesianPoint
}

function rotate(point: CartesianPoint, angle: number): CartesianPoint {
  const cosAngle = Math.cos(angle)
  const sinAngle = Math.sin(angle)

  return {
    x: point.x * cosAngle - point.y * sinAngle,
    y: point.x * sinAngle + point.y * cosAngle,
  }
}

/** Rotating-frame Cartesian position from guiding-center polar variables. */
export function rotatingCartesian(
  state: Pick<FrameState, 'r' | 'phi'>,
): CartesianPoint {
  return {
    x: state.r * Math.cos(state.phi),
    y: state.r * Math.sin(state.phi),
  }
}

/**
 * Inertial-frame guiding-center position using theta = phi + t.
 * This is a coordinate transformation of the reduced solution, not a second
 * dynamical integration.
 */
export function inertialCartesian(state: FrameState): CartesianPoint {
  const theta = state.phi + state.t

  return {
    x: state.r * Math.cos(theta),
    y: state.r * Math.sin(theta),
  }
}

/**
 * Positive inertial X/Y unit vectors expressed in rotating-frame coordinates.
 * The rotating frame advances counterclockwise by +t relative to inertial axes,
 * so inertial axes appear to rotate clockwise by -t in the rotating view.
 */
export function inertialAxesInRotatingFrame(t: number): CoordinateAxes {
  return {
    xPositive: rotate({ x: 1, y: 0 }, -t),
    yPositive: rotate({ x: 0, y: 1 }, -t),
  }
}

/** Inertial primary and secondary positions for binary angular frequency 1. */
export function inertialBodyPositions(mu: number, t: number): BinaryBodyPositions {
  const rotatingBodies: BinaryBodyPositions = {
    primary: { x: -mu, y: 0 },
    secondary: { x: 1 - mu, y: 0 },
  }

  return {
    primary: rotate(rotatingBodies.primary, t),
    secondary: rotate(rotatingBodies.secondary, t),
  }
}

/** Inertial L4/L5 positions obtained by rotating their standard frame coordinates. */
export function inertialLagrangePositions(mu: number, t: number): {
  l4: CartesianPoint
  l5: CartesianPoint
} {
  const x = 0.5 - mu
  const y = Math.sqrt(3) / 2

  return {
    l4: rotate({ x, y }, t),
    l5: rotate({ x, y: -y }, t),
  }
}
