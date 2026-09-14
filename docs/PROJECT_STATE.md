# Project State

Last updated: 2026-09-14

## Current phase

Guiding-center physics core, fixed-step RK4 integration, representative co-orbital presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, and a shared animation implementation are now present on the current development branch.

The application computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels are two coordinate representations of that same numerical solution; the inertial view does not perform a second integration.

A real-browser review established that the inertial-frame panel is not physically informative as a standalone static picture. Its educational value comes from seeing the primary, secondary, Lagrange points, and guiding center move together in inertial coordinates. Static inertial rendering is therefore treated as a coordinate-transform validation stage rather than the final presentation.

The current development branch implements the animation-first presentation. The next milestone is CI validation followed by real-browser inspection of horseshoe, L4, and L5 animations.

---

## Repository status

The maintained project documents are `AGENTS.md`, `docs/PHYSICS.md`, `docs/APP_SPEC.md`, and `docs/PROJECT_STATE.md`.

React + TypeScript + Vite, Vitest, and a Node.js 24.20.0 dev container are configured. GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not yet configured.

`README.md` has been updated to describe the current application, Codespaces port-forwarding workflow, branch/PR development workflow, and near-term feature plan.

---

## Physics model status

The guiding-center model is documented in `docs/PHYSICS.md`. It evolves guiding-center radius `r` and rotating-frame angle `phi`.

The inertial azimuth is `theta = phi + t` in the adopted nondimensional units with binary angular frequency 1. The inertial panel therefore uses only a deterministic coordinate transform of the reduced solution.

No physical-model change was made for animation. Playback speed, display-time interpolation, and inertial trail duration are visualization operations only and do not alter the numerical trajectory or diagnostics.

The reduced model remains provisional until quantitatively compared with the full PCR3BP.

---

## Application specification status

Version 0.1 is defined in `docs/APP_SPEC.md`.

Implemented or currently implemented on the development branch are direct `mu`, `r0`, `phi0`, and duration input; explicit Calculate; reduced integration; rotating/inertial orbit views; primary/secondary markers; corotation/reference orbit; L4/L5 markers; presets; numerical failure reporting; Hamiltonian drift; minimum-secondary-distance diagnostics; and synchronized animation controls.

The existing application specification already requires synchronized rotating/inertial animation and identifies a recent inertial trailing path as the preferred presentation. The latest browser review changed the development order, not the governing behavior, so no additional `APP_SPEC.md` change was required beyond the previously merged inertial-frame specification.

Still required for version 0.1 are `r(t)`, angular evolution, `phi` versus `r - 1`, current-state diagnostics during animation, and static GitHub Pages deployment.

---

## Implementation status

Implemented modules now include:

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

`src/visualization/frames.ts` provides pure transformations for rotating Cartesian position, inertial guiding-center position, inertial binary-body positions, and inertial L4/L5 positions.

`src/visualization/playback.ts` provides display-only helpers to obtain a trajectory state at arbitrary animation time and to select a recent trajectory trail. Linear interpolation between stored RK4 samples is used only for smooth rendering; stored numerical samples are not modified.

The shared animation implementation provides:

- Play, Pause, and Reset;
- selectable `0.25x`, `0.5x`, `1x`, `2x`, and `4x` playback speed;
- a nominal `1x` rate of one binary orbital period per real second;
- one shared animation time for both frame panels;
- automatic pause/reset of display time after a successful recalculation;
- replay from `t = 0` when Play is pressed at the end of a trajectory.

The rotating panel keeps the complete reduced orbit for context and moves a current-position marker along it.

The inertial panel no longer relies on the dense full transformed path. It shows the current guiding-center position and a recent trail of two binary periods. The primary, secondary, L4, and L5 markers all rotate at the same animation time.

---

## Numerical method status

A transparent fixed-step classical RK4 integrator is implemented. The current UI uses fixed `dt = 0.05`.

Animation uses the already calculated trajectory. Display-time linear interpolation and recent-trail selection are explicitly separated from the numerical solver and are never fed back into conserved-quantity diagnostics or other physical calculations.

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

The rotating panel displays the full orbit plus current position. The inertial panel displays a moving current position plus a two-binary-period trailing path. This makes the inertial panel primarily an animated representation, consistent with the physical interpretation established during browser review.

One shared animation time drives both frame panels now and is intended to drive later `r(t)`, `phi(t)`, phase-space, and current-state diagnostic markers.

---

## Validation status

Existing frame-transform tests check:

- inertial and rotating coordinates agree at `t = 0`;
- a point at `phi = 0` rotates by +90 degrees after `t = pi/2`;
- primary and secondary rotate rigidly with binary angular frequency 1;
- L4/L5 preserve their equilateral geometry under inertial rotation.

New playback-helper tests check:

- display-time interpolation between stored trajectory points;
- endpoint clamping;
- recent-trail selection with interpolated boundaries;
- correct behavior when the requested trail extends before the start of the trajectory.

The DOM test now exercises the presence of both frame views, moving-position markers, Play/Pause/Reset controls, playback-time advancement using a mocked animation frame, explicit Calculate, reset-on-recalculation, diagnostics, and invalid-input reporting.

The user previously verified that the Codespace Vite server responds through `127.0.0.1:5173`; earlier browser 404 behavior was a Codespaces port-forwarding/access issue rather than an application failure.

Current validation tasks are:

1. run CI for install, tests, and TypeScript/Vite build;
2. after CI passes and the branch is merged, inspect synchronized horseshoe animation in a real browser;
3. inspect L4 and L5 animations;
4. check whether two binary periods is an appropriate inertial trail duration;
5. verify the animated layout at a narrow viewport.

---

## Deployment status

GitHub is the canonical repository. GitHub Pages remains the intended target and is not yet configured.

---

## Known issues and open questions

Open items include the final user-facing time-step/tolerance policy, approximation-validity warnings, whether two binary periods is the best default inertial trail duration, guiding-center accuracy near horseshoe U-turns, future low-free-eccentricity full-PCR3BP initialization, and whether SVG remains sufficient as the number of plots grows.

The playback rate definition (`1x` = one binary period per real second) is an initial visualization choice and may be adjusted after browser inspection. It does not affect the physical model.

No hard validity threshold for close encounters has been adopted yet.

---

## Next recommended task

First complete CI and real-browser validation of the shared animation using horseshoe, L4, and L5 presets. Adjust only visualization parameters such as trail duration or playback-rate defaults if needed; do not alter the numerical solution in response to presentation issues.

After animation is accepted, add synchronized `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots, one feature branch at a time unless a shared plotting abstraction clearly justifies grouping them.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. GitHub is the persistent project record; do not rely on chat or uncommitted workspace state.
