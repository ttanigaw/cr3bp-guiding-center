# CR3BP Guiding-Center Visualizer

A browser-based visualization tool for reduced co-orbital dynamics in the planar circular restricted three-body problem (PCR3BP).

**Live v0.1 site:** https://ttanigaw.github.io/cr3bp-guiding-center/

The application focuses on a guiding-center model that suppresses free epicyclic motion and retains the slow co-orbital dynamics responsible for horseshoe and tadpole motion. It is intended for physical exploration, numerical checking, and education rather than as a full-PCR3BP integrator.

## Current v0.1 feature set

The application currently provides:

- direct input of mass ratio `mu`, initial guiding-center radius `r0`, initial rotating-frame angle `phi0`, and integration duration;
- Horseshoe, L4 tadpole, and L5 tadpole presets;
- deterministic client-side fixed-step RK4 integration of the reduced guiding-center equations;
- rotating-frame and inertial-frame views of the same reduced trajectory;
- shared playback controls, current-position markers, afterimages, axes, L4/L5 markers, and selectable display layers;
- synchronized fixed plots of `r(t)`, wrapped `phi(t)`, and reduced phase space `phi` versus `r - 1`;
- phase-space controls for **Magnify / 1:1 scale** and **Full width / Close-up with origin / Close-up**;
- synchronized current-state diagnostics;
- whole-trajectory diagnostics including reduced-Hamiltonian conservation error and minimum distance to the secondary;
- approximation-validity indicators such as `r2`, `epsilon_tide`, and `|dot r / r|`;
- a selectable Custom X-Y diagnostic plot with independent X/Y variables and independent Linear / `log10` display scales.

All plots and diagnostics are derived from the same stored reduced trajectory. Changing display options or Custom X-Y selectors does not trigger a second integration.

## Physical model

The authoritative model definition is in [`docs/PHYSICS.md`](docs/PHYSICS.md).

The reduced variables are the guiding-center radius `r` and rotating-frame co-orbital angle `phi`. In the adopted nondimensional units,

```text
theta = phi + t
```

where `theta` is the inertial azimuth and the binary angular frequency is unity.

The reduced guiding-center equations are

```text
dr/dt   = 2 sqrt(r) dR/dphi

dphi/dt = r^(-3/2) - 1 - 2 sqrt(r) dR/dr
```

with the perturbing potential and analytic derivatives defined in `docs/PHYSICS.md`.

The reduced conserved quantity is

```text
H_gc = -1/(2r) - sqrt(r) - R(r, phi).
```

The application monitors `Delta H_gc = H_gc(t) - H_gc(0)` as a numerical-conservation diagnostic.

This is distinct from the Jacobi constant of the full PCR3BP. The current application does **not** integrate the full PCR3BP, so it does not present the full-system Jacobi constant as though it were the conserved quantity of the reduced model.

## Rotating and inertial views

The rotating-frame trajectory is the directly integrated reduced solution.

The inertial view is a coordinate transformation of that same solution,

```text
X = r cos(phi + t)
Y = r sin(phi + t)
```

not a second dynamical model or a separate integration.

The two orbit panels share one animation time. Current markers, bodies, L4/L5 points, afterimages, and lower-plot markers therefore remain synchronized.

## Fixed state plots

### `r(t)`

Shows the guiding-center radius against nondimensional time. The dashed reference is `r = 1`, and vertical ticks are anchored to that reference with equal 1-2-5-style spacing.

### wrapped `phi(t)`

Uses

```text
-180 deg < phi <= 180 deg
```

and splits the plotted path at wrap discontinuities rather than connecting `+180 deg` directly to `-180 deg`.

### `phi` versus `r - 1`

The reduced phase-space panel includes:

- **Magnify**: vertically enlarges the radial excursion for readability;
- **1:1 scale**: uses `(r - 1) * 180/pi` for display scaling so one degree horizontally and one degree-equivalent vertically have the same screen scale;
- **Full width**: fixed `-180 deg .. +180 deg`;
- **Close-up with origin**: contracts the range while retaining `phi = 0` and the relevant L4/L5 longitude;
- **Close-up**: contracts the range without forcing `phi = 0` into view.

If a trajectory crosses the wrapped `+180 deg / -180 deg` boundary, both Close-up modes fall back to Full width.

## Diagnostics

The diagnostics UI separates different roles rather than combining them into one score.

### Current state

Values synchronized to the shared animation time include quantities such as:

- `t`;
- `r`;
- wrapped `phi`;
- `r2`;
- `epsilon_tide`;
- `H_gc`;
- `Delta H_gc`;
- `|dot r / r|`.

### Numerical conservation

`H_gc`, `Delta H_gc`, and `max |Delta H_gc|` indicate how well the numerical integration respects the conserved quantity of the reduced Hamiltonian system.

### Approximation-validity indicators

`r2`, `epsilon_tide = mu / r2^3`, and `|dot r / r|` help assess whether the reduced guiding-center approximation is being used in a controlled regime.

Version 0.1 intentionally does not impose an unsupported universal hard threshold that labels a trajectory simply “valid” or “invalid”.

## Custom X-Y diagnostic plot

The Custom X-Y panel can independently select either axis from:

- `t`;
- `r`;
- `r - 1`;
- wrapped `phi`;
- `r2`;
- `epsilon_tide`;
- `H_gc`;
- `Delta H_gc`;
- `|Delta H_gc|`;
- `dot r`;
- `dot phi`;
- `|dot r / r|`.

The default is `X = t`, `Y = Delta H_gc`.

For Linear axes, the range is fitted to the actual resolved data/reference span with small padding. A per-variable fallback span is used only when the displayed quantity is effectively constant. If zero is in range, ticks are anchored to zero with equal 1-2-5-style spacing.

Each axis independently supports `log10` when every plotted value for that variable is finite and strictly positive. In log mode, coordinates and tick values are the actual base-10 logarithms and the axis title explicitly changes to `log10(variable)`.

## Documentation

The repository documentation is part of the project specification:

- [`docs/PHYSICS.md`](docs/PHYSICS.md) — authoritative physical model and conventions;
- [`docs/APP_SPEC.md`](docs/APP_SPEC.md) — high-level application behavior;
- [`docs/PLOT_SPEC.md`](docs/PLOT_SPEC.md) — concrete plotting rules;
- [`docs/DIAGNOSTICS_SPEC.md`](docs/DIAGNOSTICS_SPEC.md) — diagnostics and Custom X-Y definitions;
- [`docs/VISUAL_DESIGN.md`](docs/VISUAL_DESIGN.md) — orbit-panel visual conventions;
- [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) — current implementation state, validation, and next work;
- [`AGENTS.md`](AGENTS.md) — repository working rules for contributors and coding agents.

## Repository structure

The main source layout is approximately:

```text
src/
  physics/
    guidingCenter.ts
    integrator.ts
    diagnostics.ts
    presets.ts
  diagnostics/
    diagnosticData.ts
    diagnosticVariables.ts
  visualization/
    frames.ts
    playback.ts
    customPlotScale.ts
  components/
    TrajectoryPlot.tsx
    InertialTrajectoryPlot.tsx
    StatePlots.tsx
    CustomDiagnosticPlot.tsx
  App.tsx

tests/
docs/
```

Physics, numerical integration, diagnostic derivation, frame transforms, playback helpers, plot scaling, and React rendering are kept separate so that the numerical model can be tested independently from the UI.

## Local development

The project uses Node.js 24.20.0, also recorded in `.nvmrc`.

```sh
npm ci
npm run dev
```

The Vite development server uses port 5173 and binds to all interfaces.

Useful commands:

```sh
npm test
npm run test:watch
npm run build
npm run preview
```

## GitHub Codespaces

Create or reopen a Codespace for the repository. The dev container installs dependencies automatically with `npm ci`.

Start the development server with:

```sh
npm run dev
```

Leave that process running, then open forwarded port 5173 from the VS Code **Ports** panel. Opening the application through the current forwarded `*.app.github.dev` URL is the normal Codespaces workflow; stale forwarded URLs should not be reused after a Codespace or forwarding session changes.

## Development workflow

GitHub is the canonical source of truth. Codespaces, local workspaces, and chat sessions are replaceable working environments.

Substantial changes should normally be developed on a branch, checked by GitHub Actions (`npm ci`, `npm test`, `npm run build`), reviewed, and then merged into `main`.

Important design decisions and changes in implementation order should be recorded in the repository documentation rather than left only in chat history or commit messages.

## Deployment

The application is entirely client-side and requires no numerical backend or database.

Version 0.1 is deployed with GitHub Pages from `main` using `.github/workflows/pages.yml`:

https://ttanigaw.github.io/cr3bp-guiding-center/

The Pages build uses the repository project-site base path `/cr3bp-guiding-center/`, while local and Codespaces development continue to use `/`. A successful deployment therefore does not change the existing local development workflow.

Pushes to `main` automatically rebuild and redeploy the static site through GitHub Actions. The workflow can also be started manually with `workflow_dispatch`.

## Scope after v0.1

The main deferred extension is a full PCR3BP model for direct comparison with the reduced guiding-center solution. Possible later additions include low-free-eccentricity initialization, full-versus-reduced comparison diagnostics, additional Lagrange points, shareable URLs, and trajectory export.

Full-PCR3BP development is intentionally deferred until the reduced-model v0.1 baseline is stable.

## License

License not yet selected.
