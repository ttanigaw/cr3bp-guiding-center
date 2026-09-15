# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, bright-green pulsing third-body markers, rotating/inertial discrete afterimages, an inertial fading trail, viewer-selectable display layers, panel-local trajectory overlays, synchronized lower state plots, selectable phase-space vertical scaling, three phase-space horizontal-range modes, L4/L5-anchored Close-up axes, wrap-safe Close-up fallback, a phase-space secondary marker, and range-aware L4/L5 phase-space markers are implemented on `main`.

The current orbit-panel appearance and interaction design have been reviewed in a real browser by the project owner and are considered broadly acceptable as of 2026-09-15. The phase-space presentation before the latest three-range refinement was also reviewed and considered broadly acceptable.

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
- `docs/DIAGNOSTICS_SPEC.md`
- `README.md`

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/APP_SPEC.md` defines high-level application behavior. `docs/VISUAL_DESIGN.md` records orbit-panel rendering choices. `docs/PLOT_SPEC.md` records concrete lower-plot conventions. `docs/DIAGNOSTICS_SPEC.md` defines the planned diagnostic-data architecture, conserved-quantity monitoring, current-state diagnostics, and the custom X-Y diagnostic plot.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Current phase-space behavior

The `phi` versus `r - 1` panel has two independent option groups.

### Vertical scale

- **Magnify**: fixed-height display with vertical magnification chosen to fit the visible data and references;
- **1:1 scale**: variable panel height so `(r - 1) * 180 / pi` and `phi` in degrees have equal physical screen scale.

Vertical limits are rounded outward to simple 1-2-5-style values.

### Horizontal range

The current horizontal-range choices are:

- **Full width**: fixed wrapped interval from `-180 deg` to `+180 deg`;
- **Close-up with origin**: contracts the numerical `phi` range around the trajectory while requiring both `phi = 0` and the relevant L4/L5 longitude to remain visible;
- **Close-up**: contracts around the trajectory and relevant L4/L5 longitude without requiring `phi = 0` to remain visible.

The physical plot width remains fixed in all three modes.

For both Close-up modes:

- the relevant Lagrange longitude `+60 deg` or `-60 deg` is retained and remains the horizontal tick/reference anchor for non-wrapping trajectories;
- ticks are equally spaced relative to that anchor;
- vertical `r - 1` ticks are equally spaced relative to `r - 1 = 0`;
- if the trajectory crosses the `+180 deg / -180 deg` wrap discontinuity, the horizontal display falls back to exactly the same range and standard ticks as Full width.

The secondary has phase-space position

`(phi, r - 1) = (0, -mu)`.

It is shown with the same blue marker family as the rotating and inertial orbit panels whenever `phi = 0` lies inside the selected horizontal range. When plain **Close-up** excludes the origin, the secondary is outside the visible phase-space window and does not affect vertical fitting.

The shared **L4 / L5 points** control now governs both phase-space Lagrange points independently:

- L4 is at `(phi, r - 1) = (+60 deg, 0)`;
- L5 is at `(phi, r - 1) = (-60 deg, 0)`;
- when the shared control is on, each point is displayed if its longitude lies inside the current horizontal range;
- Full width therefore shows both L4 and L5;
- a narrow tadpole Close-up may show only the relevant one;
- when the shared control is off, neither phase-space Lagrange point is shown.

When either Close-up mode and 1:1 scale are combined, panel height is computed from the actual displayed horizontal span; wrapped trajectories that fall back to Full width therefore use the Full-width span for 1:1 scaling.

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
- phase-space vertical-scale controls;
- three horizontal-range controls: Full width, Close-up with origin, and Close-up;
- Lagrange-anchored non-wrapping Close-up grids;
- wrap-safe Full-width fallback for both Close-up modes;
- phase-space secondary marker at `(0, -mu)` whenever the origin is visible;
- range-aware L4/L5 phase-space markers synchronized to the shared display-layer switch;
- whole-trajectory numerical diagnostics and explicit calculation failure reporting.

PR #21 established the orbit-panel baseline. PR #24 added synchronized lower plots. PR #26 added phase-space vertical-scale modes. PR #28 added Close-up and axis-readability refinements. PR #30 added L4/L5-anchored Close-up ticks, the synchronized phase-space Lagrange marker, and the `Magnify` label. PR #34 added wrap-safe Full-width fallback and the phase-space secondary marker. PR #36 added the three horizontal-range choices and range-aware display of both L4 and L5; it was merged to `main` at merge commit `3a056a293a0885e4293b0d37c3443b08b3f4f4af` after GitHub Actions passed both tests and build.

---

## Validation status

Existing physics, frame-transform, playback, orbit-panel, and state-plot tests remain applicable.

The latest tests additionally verify:

- both **Close-up with origin** and **Close-up** fall back to Full-width `-180, -90, 0, 90, 180` horizontal ticks for a wrapping horseshoe trajectory;
- Full width shows both phase-space L4 and L5 markers when the shared **L4 / L5 points** layer is enabled;
- an L4 **Close-up with origin** contains `phi = 0` and `phi = +60 deg`, and shows both the secondary and the visible L4 marker;
- an L4 plain **Close-up** can omit `phi = 0`, omit the secondary, and retain `phi = +60 deg` with the L4 marker;
- the existing shared L4/L5 display switch continues to hide phase-space Lagrange markers together with the orbit-panel Lagrange markers.

PR #36 passed GitHub Actions with both `npm test` and `npm run build` successful before merge.

A real-browser review of the final three-range behavior is still useful before diagnostics implementation resumes.

---

## Planned diagnostics architecture for version 0.1

The next development stage is defined in `docs/DIAGNOSTICS_SPEC.md`.

The current reduced-model conserved quantity to monitor is the reduced Hamiltonian

`H_gc`

with conservation error

`Delta H_gc(t) = H_gc(t) - H_gc(0)`.

The full PCR3BP Jacobi integral is reserved for the future full-PCR3BP implementation and must not be presented as the conserved quantity of the current reduced integration.

The diagnostics UI should clearly distinguish:

1. **current dynamical state**, synchronized to shared animation time;
2. **numerical-conservation diagnostics**, especially `H_gc` and `Delta H_gc`;
3. **approximation-validity indicators**, especially `r2`, `epsilon_tide`, and `|dot r / r|`.

The implementation should first create one reusable diagnostic-data layer so the current-value panel, whole-trajectory summary, custom plot, and future validity warnings all use exactly the same definitions.

---

## Planned custom X-Y diagnostic plot

Version 0.1 will include one additional user-selectable diagnostic plot.

The viewer will independently choose the X and Y variables from an initial set including:

- `t`;
- `r`;
- `r - 1`;
- wrapped `phi`;
- `r2`;
- `epsilon_tide`;
- `H_gc`;
- `Delta H_gc`;
- `|Delta H_gc|`;
- `dot r`;
- `dot phi`;
- `|dot r / r|`.

The initial default should be `X = t`, `Y = Delta H_gc`, making conservation of the reduced Hamiltonian immediately visible.

The full calculated curve will be shown together with a bright-green current marker synchronized to the same shared animation time as the orbit and fixed state plots. Wrapped-angle discontinuities must be split if `phi` is used on either axis.

The custom plot is display-only and must not trigger a new integration or alter trajectory data.

Detailed behavior is recorded in `docs/DIAGNOSTICS_SPEC.md` and `docs/PLOT_SPEC.md`.

---

## Still required for version 0.1

The revised remaining work is:

1. real-browser check of the three phase-space horizontal-range modes and L4/L5 point behavior;
2. reusable diagnostic-data model and unit tests;
3. current-state diagnostics synchronized to animation time;
4. custom X-Y diagnostic plot;
5. approximation-validity presentation without undocumented hard thresholds;
6. final browser review of diagnostics and custom plotting for horseshoe, L4, and L5 presets;
7. README refresh and static GitHub Pages deployment.

Full PCR3BP comparison remains deferred until the reduced model has been validated further.

---

## Known issues and browser checks

The orbit panels and previous phase-space baseline are accepted as workable. For the latest phase-space refinement, browser review should confirm:

- **Close-up with origin** behaves like the previously origin-retaining Close-up for L4/L5 tadpoles;
- plain **Close-up** can zoom more tightly around a tadpole and omit the origin/secondary when appropriate;
- wrapping horseshoe trajectories look horizontally identical in Full width, Close-up with origin, and Close-up;
- Full width shows both purple L4 and L5 phase-space points when **L4 / L5 points** is on;
- a narrow Close-up shows whichever of L4/L5 lies inside the displayed range;
- marker size/color remains consistent with the orbit panels.

New questions to evaluate during the diagnostics stage include:

- whether the current-state and whole-trajectory diagnostics remain visually distinct enough;
- whether `H_gc`, `Delta H_gc`, and validity quantities need stronger category labels;
- whether the custom X/Y selectors remain usable on narrow screens;
- whether automatic axis formatting is readable across variables with very different numerical scales.

These questions do not change the physical definitions.

---

## Next recommended task

Inspect the final three-range phase-space behavior in a real browser. If it is accepted, implement the reusable diagnostic-data layer first, then add synchronized current-state diagnostics followed by the custom X-Y plot.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
