# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, bright-green pulsing third-body markers, rotating/inertial discrete afterimages, an inertial fading trail, viewer-selectable display layers, panel-local trajectory overlays, synchronized lower state plots, selectable phase-space vertical scaling, phase-space horizontal close-up, and cleaned phase-space axis labeling are implemented on `main`.

The current orbit-panel appearance and interaction design have been reviewed in a real browser by the project owner and are considered broadly acceptable as of 2026-09-15.

The application computes one reduced guiding-center trajectory in the browser. Orbit panels and state plots visualize that same numerical solution; no second integration is performed.

No governing equation, integration method, stored trajectory sample, playback timing, or diagnostic definition was changed by the latest phase-space display refinement.

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

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/APP_SPEC.md` defines the high-level application requirements. `docs/VISUAL_DESIGN.md` records orbit-panel rendering choices. `docs/PLOT_SPEC.md` records the concrete version-0.1 state-plot conventions, including the phase-space scaling and range controls.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Current numerical and frame behavior

The reduced system evolves guiding-center radius `r` and rotating-frame angle `phi`. The inertial azimuth remains

`theta = phi + t`

in nondimensional units with binary angular frequency 1.

The inertial **Trajectory** layer remains a display-only rigid copy of the rotating-frame path shape, rotated using the single current display time. It is not an inertial time-history path and does not trigger a second integration.

The lower state plots and all phase-space display controls are likewise display-only views of the already calculated trajectory.

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
- phase-space **Auto fit** / **1:1 scale** vertical selection;
- phase-space **Full width** / **Close-up** horizontal selection;
- cleaned phase-space vertical limits and shallow-plot tick labels;
- numerical diagnostics and explicit calculation failure reporting.

PR #21 established the orbit-panel baseline. PR #24 added the synchronized lower plots. PR #26 added phase-space vertical-scale modes. PR #28 added the close-up range and axis-readability refinements and was merged to `main` at merge commit `b95bca280f903282dc212ba1565f9af87e7dca84` after CI passed.

---

## Current phase-space behavior

The `phi` versus `r - 1` panel now has two independent option groups.

### Vertical scale

- **Auto fit**: fixed panel height and automatically fitted vertical scale;
- **1:1 scale**: variable panel height so `(r - 1) * 180 / pi` and `phi` in degrees have equal physical screen scale.

The vertical numerical range is rounded outward to simple 1-2-5-style limits rather than exposing awkward edge values. A required upper limit near `0.064`, for example, becomes `0.1`.

When a 1:1 plot becomes shallow, only the lower and upper vertical-axis tick labels are shown, avoiding the overlapping labels observed in browser review.

### Horizontal range

- **Full width**: fixed wrapped interval from `-180 deg` to `+180 deg`;
- **Close-up**: fixed physical panel width, but the numerical `phi` range contracts around the actual wrapped trajectory with modest padding and convenient 5-degree outer limits.

Close-up retains a minimum angular span and remains inside the wrapped `[-180 deg, +180 deg]` interval. When Close-up and 1:1 scale are used together, panel height is recalculated from the narrower horizontal span so the physical 1:1 scale is preserved.

These choices are documented in `docs/PLOT_SPEC.md`.

---

## Validation status

Existing physics, frame-transform, playback, orbit-panel, and state-plot tests remain applicable.

New plot-scale unit tests verify:

- 1-2-5-style outward rounding, including `0.064 -> 0.1`;
- sensible positive, negative, and sign-changing `r - 1` display ranges;
- close-up `phi` ranges for L4- and L5-like angular intervals;
- close-up limits remain inside the wrapped interval.

The application DOM test verifies:

- Auto fit and Full width are the defaults;
- 1:1 scale remains selectable;
- Close-up can be selected independently;
- L4 tadpole Close-up reduces the numerical horizontal span while preserving the physical SVG width;
- a shallow L4 1:1 plot uses only two vertical tick labels.

The first CI run for PR #28 exposed a range-helper edge case in which one-sided positive data gained an unnecessary small negative lower limit. The helper was corrected to keep one-sided data anchored at corotation. The subsequent CI run passed both `npm test` and `npm run build` before PR #28 was merged.

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

- the simplified top/bottom vertical labels remain readable in shallow 1:1 views;
- nice outer limits are intuitive across horseshoe, L4, and L5 presets;
- L4/L5 Close-up provides a useful magnification without excessive empty horizontal space;
- the two independent option groups are visually clear;
- Close-up plus 1:1 produces the expected taller panel without altering the physical panel width.

---

## Next recommended task

Inspect all four phase-space display combinations for horseshoe, L4, and L5 presets in a real browser. If the presentation is accepted, add current-state diagnostics synchronized to the shared animation time, then approximation-validity indicators and GitHub Pages deployment.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
