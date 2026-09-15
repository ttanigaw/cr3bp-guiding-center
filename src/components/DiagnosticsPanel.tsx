import { diagnosticSample } from '../diagnostics/diagnosticData'
import { reducedHamiltonian } from '../physics/guidingCenter'
import type { TrajectoryDiagnostics } from '../physics/diagnostics'
import type { TrajectoryPoint } from '../physics/integrator'
import CustomDiagnosticPlot from './CustomDiagnosticPlot'
import './CustomDiagnosticPlot.css'
import './DiagnosticsPanel.css'

interface DiagnosticsPanelProps {
  trajectory: readonly TrajectoryPoint[]
  currentPoint: TrajectoryPoint
  mu: number
  summary: TrajectoryDiagnostics
}

function formatScientific(value: number): string {
  return value === 0 ? '0' : value.toExponential(3)
}

function formatSigned(value: number, digits = 4): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}`
}

export default function DiagnosticsPanel({
  trajectory,
  currentPoint,
  mu,
  summary,
}: DiagnosticsPanelProps) {
  const initialHamiltonian = reducedHamiltonian(trajectory[0], mu)
  const current = diagnosticSample(currentPoint, mu, initialHamiltonian)
  const binaryPeriods = trajectory[trajectory.length - 1].t / (2 * Math.PI)

  return (
    <>
      <CustomDiagnosticPlot trajectory={trajectory} currentPoint={currentPoint} mu={mu} />

      <section className="diagnostics-card" aria-labelledby="diagnostics-title">
        <div>
          <p className="eyebrow">Reduced-model diagnostics</p>
          <h2 id="diagnostics-title">Diagnostics</h2>
        </div>

        <div className="diagnostic-section">
          <div className="diagnostic-section-heading">
            <h3>Current state</h3>
            <span>shared animation time</span>
          </div>
          <dl className="diagnostics-grid diagnostics-grid-current">
            <div><dt>t</dt><dd data-diagnostic="current-t">{current.t.toFixed(3)}</dd></div>
            <div><dt>r</dt><dd data-diagnostic="current-r">{current.r.toFixed(6)}</dd></div>
            <div><dt>φ</dt><dd data-diagnostic="current-phi">{current.phiDegreesWrapped.toFixed(2)}°</dd></div>
            <div><dt>r₂</dt><dd data-diagnostic="current-r2">{current.r2.toFixed(6)}</dd></div>
          </dl>
        </div>

        <div className="diagnostic-section diagnostic-section-conservation">
          <div className="diagnostic-section-heading">
            <h3>Numerical conservation</h3>
            <span>reduced Hamiltonian</span>
          </div>
          <dl className="diagnostics-grid diagnostics-grid-conservation">
            <div><dt>H_gc</dt><dd data-diagnostic="current-hgc">{current.hGc.toFixed(10)}</dd></div>
            <div><dt>ΔH_gc</dt><dd data-diagnostic="current-dhgc">{formatScientific(current.deltaHGc)}</dd></div>
            <div><dt>Max |ΔH_gc|</dt><dd>{formatScientific(summary.maxHamiltonianDrift)}</dd></div>
          </dl>
          <p className="diagnostic-note">
            H_gc conservation tests numerical integration of the reduced Hamiltonian model; it does not by itself validate the guiding-center approximation.
          </p>
        </div>

        <div className="diagnostic-section diagnostic-section-validity">
          <div className="diagnostic-section-heading">
            <h3>Approximation validity</h3>
            <span>continuous indicators; no hard threshold</span>
          </div>
          <dl className="diagnostics-grid diagnostics-grid-validity">
            <div><dt>ε_tide</dt><dd data-diagnostic="current-epsilon">{formatScientific(current.epsilonTide)}</dd></div>
            <div><dt>|ṙ / r|</dt><dd data-diagnostic="current-radial-rate">{formatScientific(current.absRadialRate)}</dd></div>
            <div><dt>ṙ</dt><dd data-diagnostic="current-rdot">{formatSigned(current.rDot, 6)}</dd></div>
            <div><dt>φ̇</dt><dd data-diagnostic="current-phidot">{formatSigned(current.phiDot, 6)}</dd></div>
          </dl>
        </div>

        <div className="diagnostic-section">
          <div className="diagnostic-section-heading">
            <h3>Whole trajectory</h3>
            <span>calculated orbit summary</span>
          </div>
          <dl className="diagnostics-grid diagnostics-grid-summary">
            <div><dt>Min secondary distance</dt><dd>{summary.minSecondaryDistance.toFixed(4)}</dd></div>
            <div><dt>Binary periods</dt><dd>{binaryPeriods.toFixed(1)}</dd></div>
            <div><dt>Integration points</dt><dd>{trajectory.length.toLocaleString()}</dd></div>
          </dl>
        </div>
      </section>
    </>
  )
}
