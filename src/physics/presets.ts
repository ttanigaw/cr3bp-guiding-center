import type { GuidingCenterState } from './guidingCenter'

export type OrbitPresetId = 'horseshoe' | 'l4-tadpole' | 'l5-tadpole'

export interface OrbitPreset {
  id: OrbitPresetId
  label: string
  description: string
  mu: number
  initialState: GuidingCenterState
  dt: number
  tMax: number
}

/**
 * Numerically validated example trajectories for the reduced guiding-center
 * model. These are intended as reproducible examples and future UI defaults,
 * not as universal physical initial conditions.
 */
export const orbitPresets: Readonly<Record<OrbitPresetId, OrbitPreset>> = {
  horseshoe: {
    id: 'horseshoe',
    label: 'Horseshoe',
    description: 'Wide co-orbital libration around opposition.',
    mu: 0.001,
    initialState: {
      r: 1.02,
      phi: Math.PI,
    },
    dt: 0.05,
    tMax: 250,
  },
  'l4-tadpole': {
    id: 'l4-tadpole',
    label: 'L4 tadpole',
    description: 'Tadpole libration around the leading triangular region.',
    mu: 0.001,
    initialState: {
      r: 1,
      phi: (80 * Math.PI) / 180,
    },
    dt: 0.05,
    tMax: 160,
  },
  'l5-tadpole': {
    id: 'l5-tadpole',
    label: 'L5 tadpole',
    description: 'Mirror-image tadpole libration around the trailing triangular region.',
    mu: 0.001,
    initialState: {
      r: 1,
      phi: (-80 * Math.PI) / 180,
    },
    dt: 0.05,
    tMax: 160,
  },
}
