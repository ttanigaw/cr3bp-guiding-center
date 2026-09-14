# Project State

Last updated: 2026-09-14

## Current phase

Guiding-center physics core, fixed-step RK4 integration, representative co-orbital presets, editable initial conditions, trajectory diagnostics, and static rotating/inertial frame visualizations are implemented.

The application computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels are two coordinate representations of that same numerical solution; the inertial view does not perform a second integration.

The next application goal is to validate the two-panel layout in a real browser and then add one shared animation clock.

---

## Repository status

The maintained project documents are `AGENTS.md`, `docs/PHYSICS.md`, `docs/APP_SPEC.md`, and `docs/PROJECT_STATE.md`.

React + TypeScript + Vite, Vitest, and a Node.js 24.20.0 dev container are configured. GitHub Actions CI runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not yet configured.

---

## Physics model status

The guiding-center model is documented in `docs/PHYSICS.md`. It evolves guiding-center radius `r` and rotating-frame angle `phi`.

The inertial azimuth is `theta = phi + t` in the adopted nondimensional units with binary angular frequency 1. The inertial panel therefore uses only a deterministic coordinate transform of the reduced solution.

The reduced model remains provisional until quantitatively compared with the full PCR3BP.

---

## Application specification status

Version 0.1 is defined in `docs/APP_SPEC.md`.

Implemented portions include direct `mu`, `r0`, `phi0`, and duration input; explicit Calculate; reduced integration; rotating and inertial static orbit views; primary/secondary markers; corotation/reference orbit; L4/L5 markers; presets; numerical failure reporting; Hamiltonian drift; and minimum-secondary-distance diagnostics.

Still required for version 0.1 are synchronized animation, `r(t)`, angular evolution, `phi` versus `r - 1`, current-state diagnostics during animation, and static GitHub Pages deployment.

---

## Implementation status

Implemented modules include:

    src/
      physics/
        guidingCenter.ts
        integrator.ts
        diagnostics.ts
        presets.ts
      visualization/
        frames.ts
      components/
        TrajectoryPlot.tsx
        InertialTrajectoryPlot.tsx
      App.tsx

`src/visualization/frames.ts` provides pure transformations for rotating Cartesian position, inertial guiding-center position, inertial binary-body positions, and inertial L4/L5 positions. React rendering does not define the frame transformation equations.

`InertialTrajectoryPlot.tsx` transforms each already-calculated trajectory sample using `theta = phi + t`. Like the rotating plot, paths longer than 1200 displayed vertices are downsampled for rendering only; the numerical trajectory and diagnostics remain unchanged.

The current static inertial plot shows the full transformed guiding-center path. Primary, secondary, L4, and L5 markers are shown at their `t = 0` positions because there is not yet an animation time. Their later motion will be driven by the shared animation clock.

---

## Numerical method status

A transparent fixed-step classical RK4 integrator is implemented. The current UI uses fixed `dt = 0.05`. The inertial view reuses its output and adds no numerical integration cost beyond deterministic coordinate transformation and rendering.

---

## Representative orbit presets

All current presets use `mu = 0.001`.

- Horseshoe: `r0 = 1.02`, `phi0 = pi`, `dt = 0.05`, `tMax = 250`.
- L4 tadpole: `r0 = 1`, `phi0 = +80 deg`, `dt = 0.05`, `tMax = 160`.
- L5 tadpole: `r0 = 1`, `phi0 = -80 deg`, `dt = 0.05`, `tMax = 160`.

---

## Visualization status

The rotating panel uses `x = r cos(phi)` and `y = r sin(phi)`.

The inertial panel uses `X = r cos(phi + t)` and `Y = r sin(phi + t)`. At `t = 0`, the two Cartesian axis systems coincide. The binary and L4/L5 inertial transforms use the same positive counterclockwise rotation convention.

Both panels use equal-axis SVG views with the same approximate limits `[-1.35, 1.35]`. On sufficiently wide screens they are displayed side by side with similar visual weight; below 1120 px they stack while remaining adjacent in reading order.

The inertial full path is rendered somewhat thinner and more subdued because long integrations produce many overlapping revolutions. This is a display-only choice.

---

## Validation status

GitHub Actions automatically runs install, tests, and build on pull requests.

New frame-transform unit tests check:

- inertial and rotating coordinates agree at `t = 0`;
- a point at `phi = 0` rotates by +90 degrees after `t = pi/2`;
- primary and secondary rotate rigidly with binary angular frequency 1;
- L4/L5 preserve their equilateral geometry under inertial rotation.

The DOM test checks that both rotating and inertial trajectory panels are rendered while retaining the explicit Calculate and error-reporting workflow.

The static inertial panel has not yet been visually inspected in a fresh real browser after this implementation. That remains the next validation step.

---

## Deployment status

GitHub is the canonical repository. GitHub Pages remains the intended target and is not yet configured.

---

## Known issues and open questions

Open items include the final user-facing time-step/tolerance policy, approximation-validity warnings, the default inertial trail length during animation, guiding-center accuracy near horseshoe U-turns, future low-free-eccentricity full-PCR3BP initialization, and whether SVG remains sufficient as the number of plots grows.

The static inertial path can be visually dense for long integrations. This is expected and is why animation should prefer a recent trail or otherwise subdued accumulated path.

---

## Next recommended task

First inspect the two orbit panels in a real desktop browser and at a narrow viewport, including horseshoe, L4, and L5 presets.

After that validation, add one shared animation clock with play, pause, reset, and playback speed. It should drive the current-position marker in both panels and the inertial primary, secondary, and L4/L5 markers. The numerical trajectory must remain unchanged.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. GitHub is the persistent project record; do not rely on chat or uncommitted workspace state.
