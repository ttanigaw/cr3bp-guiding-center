# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, pulsing third-body markers, and discrete afterimages are implemented on `main`.

The current development branch `feature/orange-afterimages-fade-trail` refines the display language of the third body and its motion history. No governing equation, integration method, stored trajectory sample, or diagnostic definition is changed.

The application computes one reduced guiding-center trajectory in the browser. The rotating and inertial panels are two coordinate representations of that same numerical solution; the inertial view does not perform a second integration.

---

## Repository and documentation status

GitHub is the canonical project record. Maintained documents include:

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

Animation introduces no change to the governing equations or numerical solution. Playback speed, display-time interpolation, afterimages, fading trails, axis overlays, auxiliary geometry lines, pulse animation, and theme styling are visualization operations only.

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
- dark space-like application theme;
- digital-style fixed-width playback numerals;
- smooth one-second third-body pulse;
- three inertial third-body afterimages at `T/12`, `2T/12`, and `3T/12`;
- maximum reduced-Hamiltonian drift diagnostic;
- minimum distance to the secondary;
- explicit numerical-failure reporting.

At `1x` playback, one binary orbital period is displayed per real second. Available speed multipliers are `0.25x`, `0.5x`, `1x`, `2x`, and `4x`.

A successful recalculation pauses playback and resets display time to `t = 0`. Pressing Play after reaching the end restarts from `t = 0`.

---

## Current visualization refinements

The branch `feature/orange-afterimages-fade-trail` adds or changes the following display behavior:

- the third-body current-position marker changes from cyan/green to a bright orange fill;
- the current marker and all afterimages no longer have a white outline;
- the three afterimages use the same orange color family as the current marker, retaining relative peak strengths `3/4`, `2/4`, and `1/4`;
- the secondary body changes to blue so it remains visually distinct from the orange third body;
- the rotating-frame panel now also displays the same three afterimages at `T/12`, `2T/12`, and `3T/12` in the past;
- near-overlap of those rotating-frame afterimages is expected and is not artificially separated;
- the inertial panel retains the three discrete afterimages and additionally displays a thin fading orange trail covering the most recent `4T/12 = T/3`;
- the inertial trail is divided into short line segments whose opacity increases continuously toward the present and tends to zero at the oldest `4T/12` endpoint;
- the fading trail uses display-time interpolation only and never feeds back into the solver or diagnostics.

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

The DOM test for the current branch is updated to verify:

- both frame views;
- two current-position markers;
- digital-number playback spans;
- three afterimages in each frame after sufficient animation time, for six total;
- inertial fading-trail segments after sufficient animation time;
- disappearance of afterimages and fading-trail segments after Reset;
- L4/L5 geometry overlays and axis labels;
- explicit Calculate, diagnostics, and invalid-input reporting.

CI has not yet been run for `feature/orange-afterimages-fade-trail` at the time of this update.

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

Run CI for `feature/orange-afterimages-fade-trail`. If tests and build pass, merge the branch and inspect horseshoe, L4, and L5 animations in a real browser. Pay particular attention to third-body/secondary color separation, rotating-frame afterimage overlap, and the shape and visual decay of the inertial `4T/12` fading trail.

After these refinements are accepted, continue with synchronized `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
