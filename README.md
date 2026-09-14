# CR3BP Guiding-Center Visualizer

A browser-based visualization tool for co-orbital motion in the planar circular restricted three-body problem (PCR3BP).

The project focuses on a reduced guiding-center model that suppresses free epicyclic motion while retaining the slow co-orbital dynamics responsible for horseshoe and tadpole trajectories.

## Current capabilities

The browser application currently supports:

- direct input of mass ratio `mu`, initial guiding-center radius `r0`, initial rotating-frame angle `phi0`, and integration duration;
- validated horseshoe, L4 tadpole, and L5 tadpole presets;
- client-side fixed-step RK4 integration of the reduced guiding-center equations;
- rotating-frame and inertial-frame visualizations of the same reduced trajectory;
- shared animation controls for the two frame views;
- a full rotating-frame orbit with a moving current-position marker;
- an inertial-frame current position with a recent trail, rotating primary/secondary, and rotating L4/L5 markers;
- reduced-Hamiltonian drift and minimum-secondary-distance diagnostics.

The inertial view is a coordinate transformation of the already calculated reduced solution. It does not perform a second dynamical integration.

Time-series and phase-space plots are planned next. Full PCR3BP comparison is intentionally deferred until the reduced model has been validated further.

## Physical model

The authoritative physical model is documented in:

`docs/PHYSICS.md`

The reduced variables are the guiding-center radius `r` and rotating-frame co-orbital angle `phi`. In the adopted nondimensional units, the inertial azimuth is

`theta = phi + t`.

The reduced radial variable is a guiding-center radius, not in general the instantaneous physical radius of a full PCR3BP trajectory.

## Application specification and project state

Application behavior and visualization requirements are defined in:

`docs/APP_SPEC.md`

Current implementation status, validation notes, open questions, and the next recommended task are recorded in:

`docs/PROJECT_STATE.md`

Contributors and coding agents should also read `AGENTS.md` before substantial work.

## Repository structure

The main source layout is:

    src/
      physics/
        guidingCenter.ts
        integrator.ts
        diagnostics.ts
        presets.ts
      visualization/
        frames.ts
        playback.ts
      components/
        TrajectoryPlot.tsx
        InertialTrajectoryPlot.tsx
      App.tsx

    tests/
    docs/

Physics, integration, frame transforms, playback helpers, and React rendering are kept separate so the numerical model can be tested independently of the UI.

## Local development

Use Node.js 24.20.0, also recorded in `.nvmrc`:

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

Leave that process running, then open forwarded port 5173 from the VS Code **Ports** panel. Opening the application in the local desktop browser through the forwarded `*.app.github.dev` address is the normal Codespaces workflow.

## Development workflow

GitHub is the canonical source of truth. Codespaces, local workspaces, and chat sessions are replaceable working environments.

Substantial changes should normally be developed on a branch, checked by GitHub Actions (`npm ci`, `npm test`, `npm run build`), reviewed, and then merged into `main`.

Important design decisions and changes in implementation order must be recorded in the repository documentation rather than left only in chat history or commit messages.

## Deployment

The intended deployment target is GitHub Pages. The application is entirely client-side and requires no numerical backend or database.

GitHub Pages deployment is not yet configured.

## Planned next features

Near-term work includes:

- `r(t)` visualization synchronized to animation time;
- wrapped `phi(t)` visualization;
- `phi` versus `r - 1` phase-space visualization;
- current-state diagnostics synchronized to animation;
- approximation-validity indicators;
- GitHub Pages deployment.

Later work may add full PCR3BP integration, low-free-eccentricity initialization, direct full-versus-reduced comparison, additional Lagrange points, shareable URLs, and trajectory export.

## License

License not yet selected.
