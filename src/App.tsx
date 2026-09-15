import { useEffect, useRef, useState, type FormEvent } from 'react'
import InertialTrajectoryPlot from './components/InertialTrajectoryPlot'
import StatePlots from './components/StatePlots'
import TrajectoryPlot from './components/TrajectoryPlot'
import { trajectoryDiagnostics, type TrajectoryDiagnostics } from './physics/diagnostics'
import { integrateGuidingCenter, type TrajectoryPoint } from './physics/integrator'
import { orbitPresets, type OrbitPresetId } from './physics/presets'
import { trajectoryPointAtTime } from './visualization/playback'

const presetOrder: OrbitPresetId[] = ['horseshoe', 'l4-tadpole', 'l5-tadpole']
const DEFAULT_DT = 0.05
const BASE_PLAYBACK_RATE = 2 * Math.PI
const playbackSpeeds = [0.25, 0.5, 1, 2, 4]

interface DraftInputs {
  mu: string
  r0: string
  phi0Degrees: string
  tMax: string
}

interface CalculationResult {
  trajectory: TrajectoryPoint[]
  diagnostics: TrajectoryDiagnostics
  mu: number
  r0: number
  phi0Degrees: number
  tMax: number
  dt: number
}

interface SharedDisplayOptions {
  showAfterimages: boolean
  showLagrangePoints: boolean
  showLagrangeTriangles: boolean
}

interface RotatingDisplayOptions {
  showTrajectory: boolean
  showAxes: boolean
}

interface InertialDisplayOptions {
  showTrajectory: boolean
  showAxes: boolean
}

function presetToInputs(presetId: OrbitPresetId): DraftInputs {
  const preset = orbitPresets[presetId]

  return {
    mu: String(preset.mu),
    r0: String(preset.initialState.r),
    phi0Degrees: String((preset.initialState.phi * 180) / Math.PI),
    tMax: String(preset.tMax),
  }
}

function parseFinite(value: string, label: string): number {
  if (value.trim() === '') {
    throw new RangeError(`${label} is required.`)
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new RangeError(`${label} must be a finite number.`)
  }
  return parsed
}

function calculate(inputs: DraftInputs): CalculationResult {
  const mu = parseFinite(inputs.mu, 'μ')
  const r0 = parseFinite(inputs.r0, 'r₀')
  const phi0Degrees = parseFinite(inputs.phi0Degrees, 'φ₀')
  const tMax = parseFinite(inputs.tMax, 't max')

  if (mu < 0 || mu > 0.5) {
    throw new RangeError('μ must satisfy 0 ≤ μ ≤ 0.5.')
  }
  if (r0 <= 0) {
    throw new RangeError('r₀ must be positive.')
  }
  if (tMax < 0) {
    throw new RangeError('t max must be non-negative.')
  }

  const initialState = {
    r: r0,
    phi: (phi0Degrees * Math.PI) / 180,
  }
  const trajectory = integrateGuidingCenter(initialState, mu, {
    dt: DEFAULT_DT,
    tMax,
  })

  return {
    trajectory,
    diagnostics: trajectoryDiagnostics(trajectory, mu),
    mu,
    r0,
    phi0Degrees,
    tMax,
    dt: DEFAULT_DT,
  }
}

function formatScientific(value: number): string {
  return value === 0 ? '0' : value.toExponential(3)
}

function ToggleButton({
  label,
  pressed,
  onClick,
}: {
  label: string
  pressed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`toggle-button${pressed ? ' active' : ''}`}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<OrbitPresetId | null>('horseshoe')
  const [draftInputs, setDraftInputs] = useState<DraftInputs>(() => presetToInputs('horseshoe'))
  const [result, setResult] = useState<CalculationResult>(() => calculate(presetToInputs('horseshoe')))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [animationTime, setAnimationTime] = useState(0)
  const [sharedDisplayOptions, setSharedDisplayOptions] = useState<SharedDisplayOptions>({
    showAfterimages: true,
    showLagrangePoints: true,
    showLagrangeTriangles: true,
  })
  const [rotatingDisplayOptions, setRotatingDisplayOptions] = useState<RotatingDisplayOptions>({
    showTrajectory: true,
    showAxes: true,
  })
  const [inertialDisplayOptions, setInertialDisplayOptions] = useState<InertialDisplayOptions>({
    showTrajectory: true,
    showAxes: true,
  })
  const previousFrameTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isPlaying) {
      previousFrameTimeRef.current = null
      return
    }

    let frameId = 0

    const animate = (timestamp: number) => {
      if (previousFrameTimeRef.current === null) {
        previousFrameTimeRef.current = timestamp
      }

      const elapsedSeconds = (timestamp - previousFrameTimeRef.current) / 1000
      previousFrameTimeRef.current = timestamp
      const advance = elapsedSeconds * BASE_PLAYBACK_RATE * playbackSpeed

      setAnimationTime((current) => {
        const next = Math.min(current + advance, result.tMax)
        if (next >= result.tMax) {
          setIsPlaying(false)
        }
        return next
      })

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, playbackSpeed, result.tMax])

  const loadPreset = (presetId: OrbitPresetId) => {
    setSelectedPresetId(presetId)
    setDraftInputs(presetToInputs(presetId))
    setErrorMessage(null)
  }

  const updateDraft = (field: keyof DraftInputs, value: string) => {
    setDraftInputs((current) => ({ ...current, [field]: value }))
    setSelectedPresetId(null)
  }

  const handleCalculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const nextResult = calculate(draftInputs)
      setResult(nextResult)
      setAnimationTime(0)
      setIsPlaying(false)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The calculation failed.')
    }
  }

  const handlePlay = () => {
    if (animationTime >= result.tMax) {
      setAnimationTime(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => setIsPlaying(false)
  const handleReset = () => {
    setIsPlaying(false)
    setAnimationTime(0)
  }

  const orbitalPeriods = result.tMax / (2 * Math.PI)
  const currentPoint = trajectoryPointAtTime(result.trajectory, animationTime)
  const currentPeriods = currentPoint.t / (2 * Math.PI)

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
          <p className="eyebrow">Initial conditions</p>
          <h2>Calculate an orbit</h2>

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
                  onClick={() => loadPreset(presetId)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              )
            })}
          </div>

          <form className="parameter-form" onSubmit={handleCalculate}>
            <label>
              <span>Mass ratio μ</span>
              <input name="mu" type="number" step="any" value={draftInputs.mu} onChange={(event) => updateDraft('mu', event.target.value)} />
            </label>
            <label>
              <span>Initial radius r₀</span>
              <input name="r0" type="number" step="any" value={draftInputs.r0} onChange={(event) => updateDraft('r0', event.target.value)} />
            </label>
            <label>
              <span>Initial angle φ₀</span>
              <div className="input-with-unit">
                <input name="phi0Degrees" type="number" step="any" value={draftInputs.phi0Degrees} onChange={(event) => updateDraft('phi0Degrees', event.target.value)} />
                <span>deg</span>
              </div>
            </label>
            <label>
              <span>Integration duration t max</span>
              <input name="tMax" type="number" step="any" min="0" value={draftInputs.tMax} onChange={(event) => updateDraft('tMax', event.target.value)} />
            </label>

            <button className="calculate-button" type="submit">Calculate</button>
          </form>

          {errorMessage && <p className="calculation-error" role="alert">{errorMessage}</p>}

          <p className="control-note">
            Presets load validated example values. Changes are applied only when you press Calculate.
            The current fixed integration step is Δt = {DEFAULT_DT}.
          </p>
        </aside>

        <div className="result-stack">
          <section className="playback-card" aria-labelledby="playback-title">
            <div>
              <p className="eyebrow">Shared animation time</p>
              <h2 id="playback-title">Playback</h2>
            </div>
            <div className="playback-controls">
              <button type="button" onClick={handlePlay} disabled={isPlaying || result.tMax === 0}>Play</button>
              <button type="button" onClick={handlePause} disabled={!isPlaying}>Pause</button>
              <button type="button" onClick={handleReset} disabled={animationTime === 0 && !isPlaying}>Reset</button>
              <label>
                <span>Speed</span>
                <select value={playbackSpeed} onChange={(event) => setPlaybackSpeed(Number(event.target.value))}>
                  {playbackSpeeds.map((speed) => <option key={speed} value={speed}>{speed}×</option>)}
                </select>
              </label>
            </div>
            <p className="playback-status" aria-live="polite">
              t = <span className="digital-number time-number">{currentPoint.t.toFixed(2)}</span>
              {' · '}
              <span className="digital-number period-number">{currentPeriods.toFixed(2)}</span> binary periods
              {isPlaying ? ' · playing' : ' · paused'}
            </p>
            <p className="playback-note">
              At 1×, one binary period is shown per real second. Playback changes display time only;
              the calculated trajectory is unchanged.
            </p>
          </section>

          <section className="display-options-card" aria-labelledby="display-options-title">
            <div>
              <p className="eyebrow">Both orbit panels</p>
              <h2 id="display-options-title">Display layers</h2>
            </div>
            <div className="toggle-button-row" role="group" aria-label="Shared orbit display options">
              <ToggleButton
                label="Afterimages"
                pressed={sharedDisplayOptions.showAfterimages}
                onClick={() => setSharedDisplayOptions((current) => ({ ...current, showAfterimages: !current.showAfterimages }))}
              />
              <ToggleButton
                label="L4 / L5 points"
                pressed={sharedDisplayOptions.showLagrangePoints}
                onClick={() => setSharedDisplayOptions((current) => ({ ...current, showLagrangePoints: !current.showLagrangePoints }))}
              />
              <ToggleButton
                label="L4 / L5 triangles"
                pressed={sharedDisplayOptions.showLagrangeTriangles}
                onClick={() => setSharedDisplayOptions((current) => ({ ...current, showLagrangeTriangles: !current.showLagrangeTriangles }))}
              />
            </div>
          </section>

          <div className="orbit-panel-grid" aria-label="Rotating and inertial orbit comparison">
            <TrajectoryPlot
              trajectory={result.trajectory}
              mu={result.mu}
              currentPoint={currentPoint}
              currentTime={currentPoint.t}
              showAfterimages={sharedDisplayOptions.showAfterimages}
              showLagrangePoints={sharedDisplayOptions.showLagrangePoints}
              showLagrangeTriangles={sharedDisplayOptions.showLagrangeTriangles}
              showTrajectory={rotatingDisplayOptions.showTrajectory}
              showAxes={rotatingDisplayOptions.showAxes}
              onToggleTrajectory={() => setRotatingDisplayOptions((current) => ({ ...current, showTrajectory: !current.showTrajectory }))}
              onToggleAxes={() => setRotatingDisplayOptions((current) => ({ ...current, showAxes: !current.showAxes }))}
            />
            <InertialTrajectoryPlot
              trajectory={result.trajectory}
              mu={result.mu}
              currentTime={currentPoint.t}
              showAfterimages={sharedDisplayOptions.showAfterimages}
              showLagrangePoints={sharedDisplayOptions.showLagrangePoints}
              showLagrangeTriangles={sharedDisplayOptions.showLagrangeTriangles}
              showTrajectory={inertialDisplayOptions.showTrajectory}
              showAxes={inertialDisplayOptions.showAxes}
              onToggleTrajectory={() => setInertialDisplayOptions((current) => ({ ...current, showTrajectory: !current.showTrajectory }))}
              onToggleAxes={() => setInertialDisplayOptions((current) => ({ ...current, showAxes: !current.showAxes }))}
            />
          </div>

          <StatePlots
            trajectory={result.trajectory}
            currentPoint={currentPoint}
            showLagrangePoints={sharedDisplayOptions.showLagrangePoints}
          />

          <section className="diagnostics-card" aria-labelledby="diagnostics-title">
            <div>
              <p className="eyebrow">Calculated trajectory</p>
              <h2 id="diagnostics-title">Diagnostics</h2>
            </div>
            <dl className="diagnostics-grid">
              <div><dt>Max |ΔH|</dt><dd>{formatScientific(result.diagnostics.maxHamiltonianDrift)}</dd></div>
              <div><dt>Min secondary distance</dt><dd>{result.diagnostics.minSecondaryDistance.toFixed(4)}</dd></div>
              <div><dt>Binary periods</dt><dd>{orbitalPeriods.toFixed(1)}</dd></div>
              <div><dt>Integration points</dt><dd>{result.trajectory.length.toLocaleString()}</dd></div>
            </dl>
            <p className="diagnostic-note">
              Hamiltonian drift is an absolute numerical-conservation diagnostic for the reduced model.
              Minimum secondary distance is measured in the adopted nondimensional rotating frame.
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
