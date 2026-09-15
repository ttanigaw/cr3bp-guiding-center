# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, bright-green pulsing third-body markers, rotating/inertial discrete afterimages, an inertial fading trail, viewer-selectable display layers, panel-local trajectory overlays, synchronized lower state plots, and selectable phase-space scale modes are implemented on `main`.

The current orbit-panel appearance and interaction design have been reviewed in a real browser by the project owner and are considered broadly acceptable as of 2026-09-15.

The application computes one reduced guiding-center trajectory in the browser. Orbit panels and state plots visualize that same numerical solution; no second integration is performed.

No governing equation, integration method, stored trajectory sample, playback timing, or diagnostic definition was changed by the phase-space scaling work.

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

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/APP_SPEC.md` defines the high-level application requirements. `docs/VISUAL_DESIGN.md` records orbit-panel rendering choices. `docs/PLOT_SPEC.md` records the concrete version-0.1 state-plot conventions, including phase-space scaling modes.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Current numerical and frame behavior

The reduced system evolves guiding-center radius `r` and rotating-frame angle `phi`. The inertial azimuth remains

`theta = phi + t`

in nondimensional units with binary angular frequency 1.

The inertial **Trajectory** layer remains a display-only rigid copy of the rotating-frame path shape, rotated using the single current display time. It is not an inertial time-history path and does not trigger a second integration.

The lower state plots and phase-space scaling modes are likewise display-only views of the already calculated trajectory.

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
- selectable phase-space scale modes;
- numerical diagnostics and explicit calculation failure reporting.

PR #21 established the current orbit-panel baseline. PR #24 added the synchronized lower plots. PR #26 added the phase-space scale modes and was merged to `main` at merge commit `2b19288880c96fe07a593d35d218daa9c6daa3b2` after CI passed.

---

## Current state-plot behavior

Three synchronized plots are displayed below the orbit panels.

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

Base behavior remains:

- horizontal axis: wrapped `phi` in degrees;
- vertical axis: `r - 1`;
- dashed corotation line at `r - 1 = 0`;
- the same wrap-discontinuity splitting is used;
- current-state marker is synchronized to shared animation time.

The phase-space panel now provides two selectable vertical-scale modes:

- **Auto fit**: default behavior, with fixed SVG height and a vertical scale chosen to fit the data;
- **1:1 scale**: keeps the horizontal plotting width and the `-180 deg` to `+180 deg` horizontal scale unchanged, while varying the SVG/panel height so `(r - 1) * 180 / pi` and `phi` in degrees have equal physical screen scale.

In 1:1 mode the vertical axis still displays physical `r - 1` values. The degree-equivalent quantity is used only to determine geometry. The same auto-derived vertical data range and padding are used to determine the variable height.

The plot curves remain thin blue lines and current markers remain bright green. Long trajectories may be uniformly downsampled for SVG rendering only; current-state interpolation, stored trajectory values, and diagnostics continue to use the full trajectory.

Concrete conventions are documented in `docs/PLOT_SPEC.md`.

---

## Validation status

Existing physics, frame-transform, playback, orbit-panel, and state-plot tests remain applicable.

The phase-space UI test verifies:

- **Auto fit** is selected by default;
- **1:1 scale** can be selected independently of all orbit-panel display controls;
- switching to 1:1 changes the phase-space SVG height;
- the SVG/viewBox horizontal width remains unchanged;
- the explanatory 1:1 scaling note is shown;
- switching back to Auto fit restores the original fixed height.

PR #26 passed GitHub Actions with both `npm test` and `npm run build` successful before merge.

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

- Auto fit reproduces the previous phase-space presentation;
- the 1:1 mode clearly communicates the intended geometric scaling;
- variable phase-space height remains understandable for horseshoe and tadpole presets, including cases where the physically correct 1:1 plot becomes very shallow;
- the horizontal axis width and `phi` scaling visibly remain unchanged between modes;
- tick labels remain readable when the 1:1 plot is shallow;
- the scale-mode buttons are easy to discover without distracting from the plot.

---

## Next recommended task

Inspect both phase-space scale modes for the horseshoe, L4, and L5 presets in a real browser. If the presentation is accepted, add current-state diagnostics synchronized to the shared animation time, then approximation-validity indicators and GitHub Pages deployment.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
