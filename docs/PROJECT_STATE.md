# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, and synchronized animation are implemented on `main`.

The current development branch `feature/space-theme-afterimages` refines the visual presentation after browser inspection. No governing equation, integration method, stored trajectory sample, or diagnostic definition is being changed.

The application still computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels are two coordinate representations of that same numerical solution; the inertial view does not perform a second integration.

---

## Repository and documentation status

GitHub is the canonical project record. Maintained documents now include:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`
- `docs/VISUAL_DESIGN.md`
- `README.md`

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/APP_SPEC.md` defines high-level application behavior. `docs/VISUAL_DESIGN.md` records concrete rendering and animation choices that are intentionally display-only.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not yet configured.

---

## Physics and numerical model

The reduced system evolves guiding-center radius `r` and rotating-frame angle `phi`. The inertial azimuth is

`theta = phi + t`

in nondimensional units with binary angular frequency 1.

Animation introduces no change to the governing equations or numerical solution. Playback speed, display-time interpolation, afterimages, axis overlays, auxiliary geometry lines, pulse animation, and theme styling are visualization operations only.

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
- inertial axes shown inside the rotating-frame view;
- fixed inertial `+X/+Y` arrows and labels in the inertial view;
- faint primary-secondary-L4/L5 triangle guides in both views;
- maximum reduced-Hamiltonian drift diagnostic;
- minimum distance to the secondary;
- explicit numerical-failure reporting.

At `1x` playback, one binary orbital period is displayed per real second. Available speed multipliers are `0.25x`, `0.5x`, `1x`, `2x`, and `4x`.

A successful recalculation pauses playback and resets display time to `t = 0`. Pressing Play after reaching the end restarts from `t = 0`.

---

## Current visualization refinements

The branch `feature/space-theme-afterimages` introduces these changes:

- the overall page and all cards use a dark space-like theme;
- SVG orbit panels use black backgrounds with high-contrast plot colors;
- sparse star-like background points and restrained radial glows are used on the page background;
- playback numerical readouts use fixed-width monospaced digital-style formatting; a seven-segment-style font is preferred when available, with normal monospace fallbacks;
- the rotating-frame trajectory line is thinner than before;
- the current third-body marker in both frame panels uses a smooth one-second pulse;
- the pulse brightens quickly and fades more gradually, but never becomes fully invisible;
- the inertial continuous recent-trail line is removed;
- instead, the inertial panel shows up to three discrete third-body afterimages at `T/12`, `2T/12`, and `3T/12` in the past, where `T = 2 pi`;
- afterimages whose requested past time precedes the trajectory start are omitted rather than clamped to `t = 0`;
- afterimage pulse phases are delayed by `1/12`, `2/12`, and `3/12` of the one-second pulse cycle;
- their peak visual strengths are `3/4`, `2/4`, and `1/4` of the current marker;
- reduced-motion browser preference disables the pulsing animation.

These details are documented in `docs/VISUAL_DESIGN.md`.

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

`playback.ts` contains display-only trajectory interpolation and recent-segment helper logic. The current inertial afterimages use `trajectoryPointAtTime` directly at fixed past-time offsets; interpolation is used only for rendering and is never fed back into the solver or diagnostics.

---

## Validation status

Existing frame-transform tests verify coordinate conventions, binary rotation, L4/L5 geometry, and clockwise inertial-axis motion in the rotating view.

Playback tests verify display-time interpolation, endpoint clamping, and trail helper behavior.

The DOM test is being updated to verify:

- both frame views;
- two current-position markers;
- digital-number playback spans;
- no continuous inertial trajectory trail;
- three afterimages after sufficient animation time has elapsed;
- afterimages disappear again after Reset;
- L4/L5 geometry overlays and axis labels;
- explicit Calculate, diagnostics, and invalid-input reporting.

CI has not yet been run for the current branch at the time of this update.

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

- whether the new dark theme has the right contrast on a real desktop browser;
- whether a locally available seven-segment-style font is actually selected or the fallback monospace font is used;
- whether the one-second asymmetric pulse is visually smooth and not distracting;
- whether afterimage brightness levels `3/4`, `2/4`, `1/4` are appropriate on the black background;
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

Run CI for `feature/space-theme-afterimages`. If tests and build pass, merge the branch and inspect horseshoe, L4, and L5 animations in a real browser, paying particular attention to the dark-theme contrast, digital time display, pulse waveform, afterimage spacing/brightness/phase, and narrow-screen readability.

After those refinements are accepted, continue with synchronized `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
