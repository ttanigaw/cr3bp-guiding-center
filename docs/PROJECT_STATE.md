# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, bright-green pulsing third-body markers, rotating/inertial discrete afterimages, an inertial fading trail, viewer-selectable display layers, panel-local trajectory overlays, and synchronized lower state plots are implemented on `main`.

The current orbit-panel appearance and interaction design have been reviewed in a real browser by the project owner and are considered broadly acceptable as of 2026-09-15.

The application computes one reduced guiding-center trajectory in the browser. The orbit panels and lower state plots all visualize that same numerical solution; no second integration is performed.

No governing equation, integration method, stored trajectory sample, playback timing, or diagnostic definition was changed by the state-plot work.

---

## Repository and documentation status

GitHub is the canonical project record. Maintained documents include:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`
- `docs/VISUAL_DESIGN.md`
- `docs/PLOT_SPEC.md`
- `README.md`

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/APP_SPEC.md` defines the high-level application requirements. `docs/VISUAL_DESIGN.md` records orbit-panel rendering choices. `docs/PLOT_SPEC.md` records the concrete version-0.1 state-plot conventions.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Current numerical and frame behavior

The reduced system evolves guiding-center radius `r` and rotating-frame angle `phi`. The inertial azimuth remains

`theta = phi + t`

in nondimensional units with binary angular frequency 1.

The inertial **Trajectory** layer remains a display-only rigid copy of the rotating-frame path shape, rotated using the single current display time. It is not an inertial time-history path and does not trigger a second integration.

The lower state plots are likewise display-only views of the already calculated trajectory.

---

## Implemented application features on main

Current `main` includes:

- direct input of `mu`, `r0`, `phi0`, and integration duration;
- validated horseshoe, L4 tadpole, and L5 tadpole presets;
- rotating and inertial orbit panels driven by one shared animation time;
- Play, Pause, Reset, and playback speed controls;
- primary, secondary, L4/L5 markers and triangle guides;
- bright-green current third-body marker with smooth asymmetric pulse;
- three bright-green discrete third-body afterimages in both panels;
- a short bright-green fading inertial trail;
- thin blue trajectory overlays in both orbit panels;
- shared display controls for afterimages, L4/L5 points, and triangle guides;
- panel-local Trajectory and Axes switches in both orbit panels;
- synchronized `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots;
- numerical diagnostics and explicit calculation failure reporting.

PR #21 established the current orbit-panel baseline and passed GitHub Actions before merge. PR #24 added the three synchronized lower plots and was merged to `main` at merge commit `f4b699746750fabf45060ff53af818153428e60b` after CI passed.

---

## Current state-plot behavior

Three synchronized plots are now displayed below the orbit panels.

### `r(t)`

- horizontal axis: nondimensional time `t`;
- vertical axis: guiding-center radius `r`;
- dashed reference line at `r = 1`;
- current-state marker synchronized to shared animation time.

### wrapped `phi(t)`

- horizontal axis: nondimensional time `t`;
- vertical axis: `phi` in degrees;
- adopted display convention: `-180 deg < phi <= 180 deg`;
- dashed reference line at `phi = 0`;
- plotted lines are split at wrap discontinuities so no artificial line joins `+180 deg` to `-180 deg`;
- current-state marker uses the same wrap convention.

### `phi` versus `r - 1`

- horizontal axis: wrapped `phi` in degrees;
- vertical axis: `r - 1`;
- dashed corotation line at `r - 1 = 0`;
- the same wrap-discontinuity splitting is used;
- current-state marker is synchronized to the shared animation time.

The plot curves are thin blue lines and current markers use the same bright-green visual language as the third body. Long trajectories may be uniformly downsampled for SVG rendering only; current-state interpolation, stored trajectory values, and diagnostics continue to use the full trajectory.

Concrete conventions are documented in `docs/PLOT_SPEC.md`.

---

## Validation status

Existing physics, frame-transform, playback, and orbit-panel tests remain applicable.

The new plot-data tests verify:

- wrapping into `-pi < phi <= pi` and `-180 deg < phi <= 180 deg`;
- correct handling of `phi = +/- pi`;
- splitting of plotted segments at wrap discontinuities.

The application DOM test verifies:

- all three lower plots render;
- all three lower current-state markers render;
- the markers move when the shared animation time advances;
- the previous orbit-panel display controls and recalculation behavior still work.

The first CI attempt exposed only an over-strict floating-point equality in the new test. The assertion was corrected to use numerical tolerance; the subsequent CI run passed both `npm test` and `npm run build` before PR #24 was merged.

---

## Still required for version 0.1

The remaining planned work is:

- current-state diagnostics synchronized to animation time;
- approximation-validity indicators and warning presentation;
- static deployment suitable for GitHub Pages.

Full PCR3BP comparison remains deferred until the reduced model has been validated further.

---

## Known issues and browser checks

The next browser review should confirm:

- `r(t)` vertical scaling is readable for horseshoe and tadpole presets;
- the wrapped `phi(t)` discontinuity is visually clear and does not show spurious connecting lines;
- the phase-space plot makes horseshoe versus tadpole behavior easy to distinguish;
- the three bright-green current markers remain visually synchronized with the orbit panels;
- the lower plot grid remains readable on narrower screens;
- tick density and decimal precision are appropriate.

---

## Next recommended task

Inspect the three new plots for the horseshoe, L4, and L5 presets in a real browser. If the presentation is accepted, add current-state diagnostics synchronized to the shared animation time, then approximation-validity indicators and GitHub Pages deployment.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
