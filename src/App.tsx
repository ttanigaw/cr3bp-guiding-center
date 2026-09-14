import { useMemo, useState } from 'react'
import TrajectoryPlot from './components/TrajectoryPlot'
import { integrateGuidingCenter } from './physics/integrator'
import { orbitPresets, type OrbitPresetId } from './physics/presets'

const presetOrder: OrbitPresetId[] = ['horseshoe', 'l4-tadpole', 'l5-tadpole']

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<OrbitPresetId>('horseshoe')
  const preset = orbitPresets[selectedPresetId]

  const trajectory = useMemo(
    () =>
      integrateGuidingCenter(preset.initialState, preset.mu, {
        dt: preset.dt,
        tMax: preset.tMax,
      }),
    [preset],
  )

  const orbitalPeriods = preset.tMax / (2 * Math.PI)

  return (
    <main>
      <header className="app-header">
        <p className="eyebrow">Planar circular restricted three-body problem</p>
        <h1>CR3BP Guiding-Center Visualizer</h1>
        <p className="lede">
          Explore reduced co-orbital motion without the fast free-epicyclic oscillation.
        </p>
      </header>

      <section className="workspace" aria-label="Orbit visualization workspace">
        <aside className="control-card">
          <p className="eyebrow">Example orbit</p>
          <h2>Validated presets</h2>
          <div className="preset-list" role="group" aria-label="Orbit preset">
            {presetOrder.map((presetId) => {
              const option = orbitPresets[presetId]
              const active = presetId === selectedPresetId

              return (
                <button
                  key={presetId}
                  type="button"
                  className={`preset-button${active ? ' active' : ''}`}
                  aria-pressed={active}
                  onClick={() => setSelectedPresetId(presetId)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              )
            })}
          </div>

          <dl className="parameter-grid">
            <div><dt>μ</dt><dd>{preset.mu}</dd></div>
            <div><dt>r₀</dt><dd>{preset.initialState.r}</dd></div>
            <div><dt>φ₀</dt><dd>{(preset.initialState.phi * 180 / Math.PI).toFixed(0)}°</dd></div>
            <div><dt>Δt</dt><dd>{preset.dt}</dd></div>
            <div><dt>t max</dt><dd>{preset.tMax}</dd></div>
            <div><dt>Binary periods</dt><dd>{orbitalPeriods.toFixed(1)}</dd></div>
          </dl>

          <p className="control-note">
            These are reproducible demonstration cases for the reduced guiding-center model.
          </p>
        </aside>

        <TrajectoryPlot trajectory={trajectory} mu={preset.mu} />
      </section>
    </main>
  )
}
