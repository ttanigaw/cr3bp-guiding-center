# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, pulsing orange third-body markers, rotating/inertial discrete afterimages, an inertial fading trail, and viewer-selectable display layers are implemented on `main`.

The application computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels are two coordinate representations of that same numerical solution; the inertial view does not perform a second integration.

No governing equation, integration method, stored trajectory sample, playback timing, or diagnostic definition was changed by the display-layer work.

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

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not yet configured.

---

## Physics and numerical model

The reduced system evolves guiding-center radius `r` and rotating-frame angle `phi`. The inertial azimuth is

`theta = phi + t`

in nondimensional units with binary angular frequency 1.

Animation and viewer display toggles introduce no change to the governing equations or numerical solution. Playback speed, display-time interpolation, afterimages, fading trails, axis overlays, auxiliary geometry lines, pulse animation, theme styling, and layer visibility are visualization operations only.

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
- bright-orange current third-body marker in both frames with no outline;
- smooth one-second asymmetric pulse for the third body;
- blue secondary-body marker to distinguish it from the orange third body;
- three discrete third-body afterimages in both frames at `T/12`, `2T/12`, and `3T/12`;
- relative afterimage peak strengths `3/4`, `2/4`, and `1/4`;
- rotating-frame afterimages shown at their true past guiding-center positions even when nearly overlapping;
- a thin orange inertial fading trail covering the most recent `4T/12 = T/3`;
- inertial axes shown inside the rotating-frame view;
- fixed inertial `+X/+Y` arrows and labels in the inertial view;
- faint primary-secondary-L4/L5 triangle guides in both views;
- dark space-like application theme;
- digital-style fixed-width playback numerals;
- viewer-selectable display layers;
- maximum reduced-Hamiltonian drift diagnostic;
- minimum distance to the secondary;
- explicit numerical-failure reporting.

At `1x` playback, one binary orbital period is displayed per real second. Available speed multipliers are `0.25x`, `0.5x`, `1x`, `2x`, and `4x`.

A successful recalculation pauses playback and resets display time to `t = 0`. Pressing Play after reaching the end restarts from `t = 0`.

---

## Current display-layer UI

Shared controls are placed above and outside the rotating/inertial panel pair:

- **Afterimages** controls discrete afterimages in both panels and the inertial fading trail together;
- **L4 / L5 points** controls both L4 and L5 point markers in both panels;
- **L4 / L5 triangles** controls both auxiliary triangle guides in both panels.

Panel-specific controls are placed inside each panel header:

- rotating frame: **Trajectory** and **Axes**;
- inertial frame: **Axes**.

All optional layers are enabled by default. The current third-body marker, primary, secondary, corotation/reference circle, numerical trajectory data, diagnostics, and playback state are not modified by these toggles. Matching optional legend entries are hidden together with their drawing layers.

These choices are documented in `docs/VISUAL_DESIGN.md`.

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

`frames.ts` contains pure rotating/inertial coordinate transforms and inertial positive-axis unit vectors expressed in rotating-frame coordinates.

`playback.ts` contains display-only trajectory interpolation and recent-segment helper logic. Discrete afterimages use `trajectoryPointAtTime`; the inertial fading trail uses `trajectoryTrailAtTime` plus segment-wise opacity. These rendering operations are never fed back into the numerical solver or diagnostics.

---

## Validation status

Existing frame-transform tests verify coordinate conventions, binary rotation, L4/L5 geometry, and clockwise inertial-axis motion in the rotating view.

Playback tests verify display-time interpolation, endpoint clamping, and recent-trail helper behavior.

The DOM test verifies:

- all shared display controls default on;
- the rotating Trajectory and both Axes controls default on;
- Afterimages hides all six discrete afterimages and the inertial fading trail together;
- L4 / L5 points hides all L4/L5 point markers;
- L4 / L5 triangles hides all four triangle guide polylines;
- the rotating Trajectory control hides only the rotating trajectory path;
- rotating and inertial Axes controls operate independently;
- explicit Calculate, diagnostics, and invalid-input reporting continue to work.

PR #19 passed GitHub Actions with both `npm test` and `npm run build` successful and was merged to `main` at merge commit `0fb5aa863b3a7c60b6fc7b36b5dbd0845b695bbd`.

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

- whether the shared control strip is visually distinct enough from panel-local controls;
- whether button active/inactive states are immediately understandable;
- whether legends should continue to hide together with their optional layers after browser inspection;
- whether the bright orange third body has the desired prominence on the black panels;
- whether blue is the best secondary-body color against the current theme;
- whether three nearly overlapping rotating-frame afterimages are visually useful rather than distracting;
- whether the inertial `4T/12` fading trail is thin enough and fades smoothly enough in a real browser;
- whether the current trail maximum opacity is appropriate relative to the discrete afterimages;
- whether a locally available seven-segment-style font is selected or the fallback monospace font is used;
- whether afterimage pulse phase delays remain intuitive at playback rates other than `1x`;
- whether `1x = one binary period per real second` is the best default playback convention;
- final user-facing time-step/tolerance policy;
- approximation-validity warning presentation;
- guiding-center accuracy near horseshoe U-turns;
- low-free-eccentricity initialization for future full-PCR3BP comparison;
- whether SVG remains sufficient as more plots are added.

No hard close-encounter validity threshold has been adopted.

---

## Next recommended task

Inspect the merged shared display controls and both panel-local control groups in a real browser, including narrow-window behavior. Pay particular attention to whether the shared/panel-local grouping is immediately understandable and whether inactive buttons are clearly distinguishable without becoming visually dominant.

After these refinements are accepted, continue with synchronized `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
