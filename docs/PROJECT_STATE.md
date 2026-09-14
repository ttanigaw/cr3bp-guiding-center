# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, and synchronized animation are implemented on `main`.

The current development branch refines the visual interpretation after real-browser inspection. No governing equation, integration method, trajectory sample, or diagnostic definition is being changed.

The application computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels are two coordinate representations of that same numerical solution; the inertial view does not perform a second integration.

A browser review established that the inertial-frame panel is useful primarily as an animation rather than as a static full-path plot. Subsequent display choices therefore emphasize frame interpretation and instantaneous geometry.

---

## Repository and documentation status

GitHub is the canonical project record. The maintained documents are:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`
- `README.md`

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/APP_SPEC.md` already requires synchronized rotating/inertial animation and a recent inertial trail, so the current work is recorded here as concrete visualization tuning rather than a change to the physical/application scope.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not yet configured.

---

## Physics and numerical model

The reduced system evolves guiding-center radius `r` and rotating-frame angle `phi`. The inertial azimuth is

`theta = phi + t`

in nondimensional units with binary angular frequency 1.

Animation introduces no change to the governing equations or numerical solution. Playback speed, display-time interpolation, inertial trail duration, axis overlays, and auxiliary geometry lines are visualization operations only.

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
- maximum reduced-Hamiltonian drift diagnostic;
- minimum distance to the secondary;
- explicit numerical-failure reporting.

At `1x` playback, one binary orbital period is displayed per real second. Available speed multipliers are `0.25x`, `0.5x`, `1x`, `2x`, and `4x`.

A successful recalculation pauses playback and resets display time to `t = 0`. Pressing Play after reaching the end restarts from `t = 0`.

---

## Current visualization refinements

The branch `feature/visual-polish` introduces the following display changes based on browser feedback:

- playback time/status text uses a monospace font so changing digits do not visually shift following text;
- the rotating-frame panel no longer uses screen-fixed rotating-frame `x/y` axes as its main coordinate overlay;
- instead, it displays the inertial `+X/+Y` axes expressed in rotating-frame coordinates;
- because the rotating frame advances counterclockwise relative to inertial space, these inertial axes appear to rotate clockwise with angle `-t` in the rotating panel;
- the inertial-frame `+X/+Y` directions remain screen-fixed and are emphasized with arrows and labels;
- faint auxiliary triangles connect the primary and secondary to L4 and L5 in both panels;
- the inertial recent trail is shortened from two binary periods to `0.5` binary period (`pi` in nondimensional time) for improved readability.

The triangle lines, coordinate-axis overlays, arrowheads, labels, and trail duration are display aids only. They are not part of the numerical state and must never feed back into the solver or diagnostics.

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

`frames.ts` contains pure rotating/inertial coordinate transforms and now also provides the inertial positive-axis unit vectors expressed in rotating-frame coordinates.

`playback.ts` contains display-only trajectory interpolation and recent-trail selection. Interpolation is used only for smooth rendering and is never fed back into the numerical solver or diagnostics.

---

## Validation status

Frame-transform tests verify:

- rotating and inertial coordinates agree at `t = 0`;
- a `phi = 0` point rotates by +90 degrees at `t = pi/2`;
- inertial axes expressed in the rotating frame rotate clockwise as expected;
- the binary rotates rigidly with angular frequency 1;
- L4/L5 preserve equilateral geometry under inertial rotation.

Playback tests verify display-time interpolation, endpoint clamping, and recent-trail selection.

The DOM test exercises both frame views, current-position markers, Play/Pause/Reset, mocked playback-time advancement, explicit Calculate, reset-on-recalculation, diagnostics, invalid-input reporting, L4/L5 geometry overlays, and axis labels.

PR #11 introduced shared animation and passed CI after a TypeScript-only test typing issue was corrected. PR #12 updated the persistent project record after merge.

The Codespace Vite server has been verified to respond on `127.0.0.1:5173`; an earlier browser 404 was a Codespaces port-forwarding/access issue rather than an application failure.

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

- whether `0.5` binary period remains the best default inertial trail duration after browser inspection;
- whether the axis-arrow and triangle-line visual weight is appropriate;
- whether `1x = one binary period per real second` is the best default playback convention;
- final user-facing time-step/tolerance policy;
- approximation-validity warning presentation;
- guiding-center accuracy near horseshoe U-turns;
- low-free-eccentricity initialization for future full-PCR3BP comparison;
- whether SVG remains sufficient as more plots are added.

No hard close-encounter validity threshold has been adopted.

---

## Next recommended task

Run CI for `feature/visual-polish`. After merge, inspect horseshoe, L4, and L5 animations in a real browser, with particular attention to:

1. readability of the rotating inertial-axis overlay;
2. clarity of `+X/+Y` in the inertial panel;
3. whether L4/L5 triangle lines are sufficiently subtle;
4. whether a `0.5`-period inertial trail gives the right amount of motion history;
5. whether monospace playback time removes distracting text motion.

After these refinements are accepted, continue with synchronized `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
