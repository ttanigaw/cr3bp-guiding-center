# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, pulsing third-body markers, rotating/inertial discrete afterimages, an inertial fading trail, and viewer-selectable display layers are implemented on `main`.

The current development branch `feature/green-body-rigid-inertial-trajectory` refines marker colors, trajectory styling, legend ordering, and adds a panel-local inertial trajectory overlay. No governing equation, integration method, stored trajectory sample, playback timing, or diagnostic definition is changed.

The application computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels use the same numerical solution; no second integration is performed.

---

## Repository and documentation status

GitHub is the canonical project record. Maintained documents include:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`
- `docs/VISUAL_DESIGN.md`
- `README.md`

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/APP_SPEC.md` defines high-level application behavior. `docs/VISUAL_DESIGN.md` records concrete rendering, animation, and display-layer choices that are intentionally display-only.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Physics and numerical model

The reduced system evolves guiding-center radius `r` and rotating-frame angle `phi`. The inertial azimuth remains

`theta = phi + t`

in nondimensional units with binary angular frequency 1.

The new inertial Trajectory overlay is explicitly a display layer: every rotating-frame path point is rotated using the single current display time `t`. It is not the inertial time-history curve obtained by using each sample's own stored time.

For each stored rotating-frame point `(r_i, phi_i)`, the overlay uses

`X_i = r_i cos(phi_i + t)`

`Y_i = r_i sin(phi_i + t)`.

Therefore the complete rotating-frame path shape remains rigid and phase-locked to the binary/secondary during playback.

---

## Implemented application features

Current `main` already includes:

- direct input of `mu`, `r0`, `phi0`, and integration duration;
- validated horseshoe, L4 tadpole, and L5 tadpole presets;
- rotating and inertial orbit panels driven by one shared animation time;
- Play, Pause, Reset, and playback speed controls;
- primary, secondary, L4/L5 markers and triangle guides;
- three discrete third-body afterimages in both panels;
- a short fading inertial trail;
- shared and panel-local display toggles;
- numerical diagnostics and explicit calculation failure reporting.

---

## Current visualization refinement

The branch `feature/green-body-rigid-inertial-trajectory` changes the display as follows:

- the third body, its three afterimages, and the inertial fading trail change from orange to bright green;
- the blue secondary remains unchanged so it stays visually distinct;
- the blue trajectory line becomes slightly thinner;
- the inertial panel gains its own **Trajectory** switch, matching the rotating panel;
- inertial Trajectory shows a rigidly rotated copy of the complete rotating-frame orbit shape, using one shared current time for every point;
- the overlay is phase-locked to the secondary and does not represent the actual inertial time-history path;
- both panel legends begin with **Primary**, **Secondary**, **Current position**;
- when afterimages are enabled, `-1/12 period`, `-2/12 period`, and `-3/12 period` follow in that order;
- optional Trajectory, Fading trail, and L4/L5 legend entries follow afterward when visible.

These choices are documented in `docs/VISUAL_DESIGN.md`.

---

## Validation status

Existing frame-transform and playback tests remain unchanged.

The DOM test for this branch verifies:

- both rotating and inertial Trajectory switches default on;
- two trajectory paths are initially rendered;
- the inertial rigid trajectory path changes with animation time;
- the two Trajectory switches operate independently;
- Afterimages still controls both sets of discrete afterimages and the inertial fading trail;
- both legends begin with Primary, Secondary, Current position;
- the previous shared and panel-local display controls continue to work.

CI has not yet been run for `feature/green-body-rigid-inertial-trajectory` at the time of this update.

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

## Known issues and browser checks

Browser inspection should confirm:

- bright green is sufficiently visible on black without overpowering the plot;
- the thinner blue trajectory remains legible;
- the inertial rigid trajectory overlay visually remains locked to the secondary throughout playback;
- users do not mistake that overlay for the actual inertial time-history trajectory;
- legend ordering remains clear when optional layers are switched off;
- the two Trajectory switches are easy to distinguish as panel-local controls.

---

## Next recommended task

Run CI for `feature/green-body-rigid-inertial-trajectory`. If tests and build pass, merge and inspect horseshoe, L4, and L5 presets in a real browser, focusing especially on the inertial rigid trajectory overlay and its synchronization with the secondary.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
