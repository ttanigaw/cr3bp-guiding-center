# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, bright-green pulsing third-body markers, rotating/inertial discrete afterimages, an inertial fading trail, viewer-selectable display layers, panel-local trajectory overlays, synchronized lower state plots, selectable phase-space vertical scaling, phase-space horizontal close-up, and L4/L5-anchored Close-up axes are implemented on `main`.

The current orbit-panel appearance and interaction design have been reviewed in a real browser by the project owner and are considered broadly acceptable as of 2026-09-15.

The application computes one reduced guiding-center trajectory in the browser. Orbit panels and state plots visualize that same numerical solution; no second integration is performed.

No governing equation, integrator, stored trajectory, playback timing, or diagnostic definition was changed by the latest phase-space display refinement.

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

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/APP_SPEC.md` defines high-level application behavior. `docs/VISUAL_DESIGN.md` records orbit-panel rendering choices. `docs/PLOT_SPEC.md` records concrete lower-plot conventions.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Current phase-space behavior

The `phi` versus `r - 1` panel has two independent option groups.

### Vertical scale

- **Magnify**: fixed-height display with vertical magnification chosen to fit the data; this is the mode previously labeled `Auto fit`;
- **1:1 scale**: variable panel height so `(r - 1) * 180 / pi` and `phi` in degrees have equal physical screen scale.

Vertical limits are rounded outward to simple 1-2-5-style values.

### Horizontal range

- **Full width**: fixed wrapped interval from `-180 deg` to `+180 deg`;
- **Close-up**: fixed physical panel width with a reduced numerical `phi` range around the trajectory.

Close-up behavior on `main` now includes:

- the relevant Lagrange longitude `+60 deg` or `-60 deg` is always included;
- an L4/L5 phase-space marker is drawn at `(phi, r - 1) = (+/-60 deg, 0)` with the same purple marker styling as the orbit panels;
- that phase-space marker is synchronized to the shared upper **L4 / L5 points** display switch;
- the relevant Lagrange longitude always has a vertical reference/grid line and numeric tick label;
- the remaining horizontal ticks are equally spaced relative to that Lagrange longitude;
- vertical `r - 1` ticks in Close-up are equally spaced relative to the existing `r - 1 = 0` corotation line.

The relevant `+60` or `-60` longitude is not forced to the horizontal center.

When Close-up and 1:1 scale are combined, panel height continues to be recomputed from the narrowed horizontal span so physical 1:1 scaling is retained.

Concrete behavior is documented in `docs/PLOT_SPEC.md`.

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
- phase-space vertical-scale and horizontal-range controls;
- Lagrange-anchored Close-up grids and marker synchronization;
- numerical diagnostics and explicit calculation failure reporting.

PR #21 established the orbit-panel baseline. PR #24 added synchronized lower plots. PR #26 added phase-space vertical-scale modes. PR #28 added Close-up and axis-readability refinements. PR #30 added L4/L5-anchored Close-up ticks, the synchronized phase-space Lagrange marker, and the `Magnify` label; it was merged to `main` at merge commit `92999a683afe36caa9edd92bd5b48351dc62f50d` after GitHub Actions passed both tests and build.

---

## Validation status

Existing physics, frame-transform, playback, orbit-panel, and state-plot tests remain applicable.

The latest tests verify:

- L4-like data select `+60 deg` and L5-like data select `-60 deg` as the phase-space anchor;
- Close-up ranges retain the selected Lagrange longitude;
- horizontal tick spacing is equal around the selected Lagrange longitude;
- vertical tick spacing is equal around `r - 1 = 0`;
- the L4 phase-space marker appears in Close-up when **L4 / L5 points** is enabled and disappears when that shared switch is disabled;
- **Magnify** is the default vertical-scale choice;
- Close-up plus 1:1 continues to preserve the fixed physical SVG width.

PR #30 passed GitHub Actions with both `npm test` and `npm run build` successful before merge.

---

## Still required for version 0.1

Remaining planned work is:

- current-state diagnostics synchronized to animation time;
- approximation-validity indicators and warning presentation;
- static deployment suitable for GitHub Pages.

Full PCR3BP comparison remains deferred until the reduced model has been validated further.

---

## Known issues and browser checks

The next browser review should confirm:

- the purple L4/L5 phase-space marker is visually consistent with the orbit panels;
- the `+60` or `-60` anchor line and label are clear without being visually dominant;
- equal-spacing horizontal ticks look natural even when the Lagrange longitude is off-center;
- zero-anchored vertical ticks remain readable in shallow 1:1 plots;
- `Magnify` communicates the default vertical mode more clearly than `Auto fit`.

---

## Next recommended task

Inspect Close-up behavior for both L4 and L5 tadpole presets in a real browser. If accepted, proceed to current-state diagnostics synchronized to the shared animation time.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
