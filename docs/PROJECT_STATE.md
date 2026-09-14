# Project State

Last updated: 2026-09-14

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, and synchronized animation are implemented on `main`.

The application computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels are two coordinate representations of that same numerical solution; the inertial view does not perform a second integration.

A browser review established that the inertial-frame panel is not physically informative as a standalone static picture. Its educational value comes from animation of the primary, secondary, Lagrange points, and guiding center together in inertial coordinates. Static inertial rendering is therefore treated only as a coordinate-transform validation stage.

---

## Repository and documentation status

GitHub is the canonical project record. The maintained documents are:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`
- `README.md`

`README.md` describes the current application, local/Codespaces development, port forwarding, branch/PR workflow, and near-term feature plan.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not yet configured.

---

## Physics and numerical model

The authoritative physical model remains `docs/PHYSICS.md`.

The reduced system evolves guiding-center radius `r` and rotating-frame angle `phi`. The inertial azimuth is

`theta = phi + t`

in nondimensional units with binary angular frequency 1.

Animation introduces no change to the governing equations or numerical solution. Playback speed, display-time interpolation, and inertial trail duration are visualization operations only.

The current solver is a transparent fixed-step classical RK4 integrator with UI time step `dt = 0.05`.

---

## Implemented application features

Current `main` includes:

- direct input of `mu`, `r0`, `phi0` in degrees, and integration duration;
- explicit Calculate action;
- validated horseshoe, L4 tadpole, and L5 tadpole presets;
- rotating-frame orbit visualization;
- inertial-frame visualization of the same reduced trajectory;
- primary, secondary, corotation/reference orbit, and L4/L5 markers;
- Play, Pause, Reset, and playback speed controls;
- one shared animation time for both frame panels;
- current-position marker in the rotating frame;
- moving inertial primary, secondary, L4/L5, and guiding-center marker;
- a recent inertial trail of two binary periods rather than the dense full transformed path;
- maximum reduced-Hamiltonian drift diagnostic;
- minimum distance to the secondary;
- explicit numerical-failure reporting.

At `1x` playback, one binary orbital period is displayed per real second. Available speed multipliers are `0.25x`, `0.5x`, `1x`, `2x`, and `4x`.

A successful recalculation pauses playback and resets the display time to `t = 0`. Pressing Play after reaching the end restarts from `t = 0`.

---

## Source structure

Relevant modules are:

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

`frames.ts` contains pure rotating/inertial coordinate transforms.

`playback.ts` contains display-only trajectory interpolation and recent-trail selection. Interpolation is used only for smooth rendering and is never fed back into the numerical solver or diagnostics.

---

## Validation status

Frame-transform tests verify:

- rotating and inertial coordinates agree at `t = 0`;
- a `phi = 0` point rotates by +90 degrees at `t = pi/2`;
- the binary rotates rigidly with angular frequency 1;
- L4/L5 preserve equilateral geometry under inertial rotation.

Playback tests verify:

- display-time interpolation;
- endpoint clamping;
- recent-trail selection with interpolated boundaries;
- correct behavior when the requested trail extends before the trajectory start.

The DOM test exercises both frame views, current-position markers, Play/Pause/Reset, mocked playback-time advancement, explicit Calculate, reset-on-recalculation, diagnostics, and invalid-input reporting.

PR #11 initially exposed a TypeScript-only test typing error after all Vitest tests passed. The test typing was corrected, and the subsequent CI run completed successfully with both `npm test` and `npm run build` passing. PR #11 was then merged to `main` (merge commit `69358d482656b24bd034e234e57aa5c70268575e`).

The Codespace Vite server has also been verified to respond on `127.0.0.1:5173`; an earlier browser 404 was a Codespaces port-forwarding/access issue rather than an application failure.

---

## Still required for version 0.1

The remaining planned features are:

- `r(t)` visualization synchronized to animation time;
- wrapped `phi(t)` visualization;
- `phi` versus `r - 1` phase-space visualization;
- current-state diagnostics synchronized to animation;
- static deployment suitable for GitHub Pages.

Full PCR3BP comparison remains deferred until the reduced model has been validated further.

---

## Known issues and open questions

Open items include:

- whether two binary periods is the best default inertial trail duration;
- whether `1x = one binary period per real second` is the best default playback convention;
- final user-facing time-step/tolerance policy;
- approximation-validity warning presentation;
- guiding-center accuracy near horseshoe U-turns;
- low-free-eccentricity initialization for future full-PCR3BP comparison;
- whether SVG remains sufficient as more plots are added.

No hard close-encounter validity threshold has been adopted.

---

## Next recommended task

First perform real-browser validation of the merged shared animation using the horseshoe, L4, and L5 presets. Check synchronization of both panels, inertial trail readability, playback speed, and narrow-screen layout.

If that validation is satisfactory, add synchronized `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots, preferably one feature branch at a time unless a shared plotting abstraction clearly justifies grouping them.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
