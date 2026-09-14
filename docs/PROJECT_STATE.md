# Project State

Last updated: 2026-09-14

## Current phase

Guiding-center physics core, fixed-step RK4 integration, representative co-orbital presets, editable initial conditions, trajectory diagnostics, and static rotating/inertial frame visualizations are implemented.

The application computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels are two coordinate representations of that same numerical solution; the inertial view does not perform a second integration.

A real-browser check established an important visualization-design point: the inertial-frame panel is not physically informative as a standalone static picture. Its intended educational value comes from seeing the primary, secondary, Lagrange points, and guiding center move together in inertial coordinates. Therefore static inertial rendering is now treated as an implementation/coordinate-transform validation stage rather than a user-facing validation milestone.

The immediate application goal is one shared animation clock for both orbit panels. Real-browser visual validation of the inertial view should be repeated after that animation is implemented.

---

## Repository status

The maintained project documents are `AGENTS.md`, `docs/PHYSICS.md`, `docs/APP_SPEC.md`, and `docs/PROJECT_STATE.md`.

React + TypeScript + Vite, Vitest, and a Node.js 24.20.0 dev container are configured. GitHub Actions CI runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not yet configured.

---

## Physics model status

The guiding-center model is documented in `docs/PHYSICS.md`. It evolves guiding-center radius `r` and rotating-frame angle `phi`.

The inertial azimuth is `theta = phi + t` in the adopted nondimensional units with binary angular frequency 1. The inertial panel therefore uses only a deterministic coordinate transform of the reduced solution.

No physical-model change is required for animation. Playback speed and trail length are visualization parameters and must not alter the numerical trajectory.

The reduced model remains provisional until quantitatively compared with the full PCR3BP.

---

## Application specification status

Version 0.1 is defined in `docs/APP_SPEC.md`.

Implemented portions include direct `mu`, `r0`, `phi0`, and duration input; explicit Calculate; reduced integration; rotating and inertial static orbit views; primary/secondary markers; corotation/reference orbit; L4/L5 markers; presets; numerical failure reporting; Hamiltonian drift; and minimum-secondary-distance diagnostics.

The application specification already requires synchronized rotating/inertial animation and identifies a recent inertial trailing path as the preferred presentation. The latest browser review changes the development order, not the governing application requirement, so `APP_SPEC.md` does not require a physics or behavior rewrite at this point.

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

The current static inertial plot shows the full transformed guiding-center path. Primary, secondary, L4, and L5 markers are shown at their `t = 0` positions because there is not yet an animation time. This static presentation should be replaced by an animation-oriented view with a moving current position and recent trail.

The next implementation should add shared playback state without changing the solver. A successful Calculate should pause playback and reset the shared animation time to `t = 0`.

---

## Numerical method status

A transparent fixed-step classical RK4 integrator is implemented. The current UI uses fixed `dt = 0.05`. The inertial view reuses its output and adds no numerical integration cost beyond deterministic coordinate transformation and rendering.

Animation may interpolate between stored trajectory samples for display only, provided that this interpolation is explicit, documented, independently tested, and never fed back into the numerical solution or trajectory diagnostics.

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

The static inertial full path is visually dense for long integrations and is not considered the final presentation. During animation the rotating panel should retain the full reduced path as context while emphasizing the current position. The inertial panel should emphasize the current position and show only a recent trail (initial target: about two binary periods) rather than relying on the full transformed path.

One shared animation time must drive:

- the rotating-frame current guiding-center marker;
- the inertial-frame current guiding-center marker;
- inertial primary and secondary positions;
- inertial L4 and L5 positions;
- later current-state markers on `r(t)`, `phi(t)`, and phase-space plots.

The initial playback control target is Play, Pause, Reset, and selectable speed. A nominal `1x` playback rate should correspond to one binary orbital period per real second; speed multipliers are display-only.

---

## Validation status

GitHub Actions automatically runs install, tests, and build on pull requests.

Frame-transform unit tests check:

- inertial and rotating coordinates agree at `t = 0`;
- a point at `phi = 0` rotates by +90 degrees after `t = pi/2`;
- primary and secondary rotate rigidly with binary angular frequency 1;
- L4/L5 preserve their equilateral geometry under inertial rotation.

The DOM test checks that both rotating and inertial trajectory panels are rendered while retaining the explicit Calculate and error-reporting workflow.

The user successfully verified that the Codespace Vite server itself responds through `127.0.0.1:5173`; earlier browser 404 behavior was a Codespaces port-forwarding/access issue rather than an application failure.

The static inertial image was judged insufficient as an end-user visualization because its physical meaning depends on motion. Consequently the next meaningful real-browser validation is after shared animation is implemented.

The next validation tasks are:

1. unit-test any display-time interpolation and recent-trail selection;
2. verify Play/Pause/Reset and speed controls without altering the integrated trajectory;
3. inspect synchronized rotating/inertial animation for horseshoe, L4, and L5 presets in a real browser;
4. verify the animated layout at a narrow viewport.

---

## Deployment status

GitHub is the canonical repository. GitHub Pages remains the intended target and is not yet configured.

---

## Known issues and open questions

Open items include the final user-facing time-step/tolerance policy, approximation-validity warnings, whether two binary periods is the best default inertial trail duration, guiding-center accuracy near horseshoe U-turns, future low-free-eccentricity full-PCR3BP initialization, and whether SVG remains sufficient as the number of plots grows.

No hard validity threshold for close encounters has been adopted yet. Playback interpolation and trail selection, if used, are visualization operations only and must remain separate from numerical diagnostics.

---

## Next recommended task

Implement one shared animation clock with Play, Pause, Reset, and playback speed. It should drive the current guiding-center marker in both panels and the inertial primary, secondary, and L4/L5 markers. The rotating panel should retain the full orbit for context; the inertial panel should use a recent trail rather than the dense full transformed trajectory.

After CI passes, inspect the animation in a real browser using horseshoe, L4, and L5 presets. Then proceed to synchronized `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. GitHub is the persistent project record; do not rely on chat or uncommitted workspace state.
