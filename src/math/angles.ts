const TWO_PI = 2 * Math.PI

/** Wrap an angle to -pi < phi <= pi. */
export function wrapPhiRadians(phi: number): number {
  let wrapped = ((phi + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI
  if (wrapped <= -Math.PI) wrapped = Math.PI
  return wrapped
}

/** Wrap an angle to -180 deg < phi <= 180 deg. */
export function wrapPhiDegrees(phi: number): number {
  return (wrapPhiRadians(phi) * 180) / Math.PI
}
