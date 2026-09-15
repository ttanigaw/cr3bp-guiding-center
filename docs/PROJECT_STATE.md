# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, trajectory diagnostics, rotating/inertial frame visualizations, synchronized animation, dark space theme, bright-green pulsing third-body markers, rotating/inertial discrete afterimages, an inertial fading trail, viewer-selectable display layers, panel-local trajectory overlays, synchronized lower state plots, selectable phase-space vertical scaling, phase-space horizontal close-up, L4/L5-anchored Close-up axes, wrap-safe Close-up fallback, and a phase-space secondary marker are implemented on `main`.

The current orbit-panel appearance and interaction design have been reviewed in a real browser by the project owner and are considered broadly acceptable as of 2026-09-15. The phase-space presentation before the latest wrap/secondary refinement was also reviewed and considered broadly acceptable.

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

- **Magnify**: fixed-height display with vertical magnification chosen to fit the data;
- **1:1 scale**: variable panel height so `(r - 1) * 180 / pi` and `phi` in degrees have equal physical screen scale.

Vertical limits are rounded outward to simple 1-2-5-style values.

### Horizontal range

- **Full width**: fixed wrapped interval from `-180 deg` to `+180 deg`;
- **Close-up**: fixed physical panel width with a reduced numerical `phi` range around the trajectory where a single continuous wrapped interval is meaningful.

Current Close-up behavior on `main` includes:

- `phi = 0` is always retained so the zero tick and secondary remain visible;
- the relevant Lagrange longitude `+60 deg` or `-60 deg` is included for non-wrapping tadpole-like views;
- an L4/L5 phase-space marker is drawn at `(phi, r - 1) = (+/-60 deg, 0)` with the same purple marker styling as the orbit panels and is synchronized to the shared **L4 / L5 points** control;
- the relevant Lagrange longitude is the horizontal tick/reference anchor for non-wrapping Close-up views;
- vertical `r - 1` ticks in Close-up are equally spaced relative to `r - 1 = 0`;
- if the trajectory crosses the `+180 deg / -180 deg` wrap discontinuity, Close-up falls back to the same `-180...180 deg` horizontal range and standard ticks as Full width, including `phi = 0`.

The secondary is shown in phase space at

`(phi, r - 1) = (0, -mu)`

using the same blue marker family as the rotating and inertial orbit panels. The displayed vertical range is expanded if necessary so this marker remains visible.

When Close-up and 1:1 scale are combined, panel height is computed from the actual displayed horizontal span; wrapped trajectories that fall back to Full width therefore use the Full-width span for 1:1 scaling.

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
- Lagrange-anchored non-wrapping Close-up grids;
- wrap-safe Full-width fallback for Close-up trajectories crossing `+/-180 deg`;
- phase-space secondary marker at `(0, -mu)`;
- whole-trajectory numerical diagnostics and explicit calculation failure reporting.

PR #21 established the orbit-panel baseline. PR #24 added synchronized lower plots. PR #26 added phase-space vertical-scale modes. PR #28 added Close-up and axis-readability refinements. PR #30 added L4/L5-anchored Close-up ticks, the synchronized phase-space Lagrange marker, and the `Magnify` label. PR #34 added `phi = 0` retention, wrap-safe Full-width fallback, and the phase-space secondary marker; it was merged to `main` at merge commit `736c98a8c4ab83cbc816cbd8590ae089046f6007` after GitHub Actions passed both tests and build.

---

## Validation status

Existing physics, frame-transform, playback, orbit-panel, and state-plot tests remain applicable.

The latest tests additionally verify:

- a wrapping horseshoe Close-up uses the Full-width `-180, -90, 0, 90, 180` horizontal ticks;
- an L4 Close-up retains both `phi = 0` and `phi = +60 deg` while still remaining narrower than Full width;
- the phase-space secondary marker is present and uses the same `secondary-body` marker styling family as the orbit panels;
- the L4 phase-space marker remains present alongside the secondary marker in L4 Close-up.

PR #34 passed GitHub Actions with both `npm test` and `npm run build` successful before merge.

A new real-browser review of the two latest refinements — zero retention/wrap fallback and the phase-space secondary marker — is still useful before proceeding to diagnostics implementation.

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

1. real-browser check of the latest phase-space wrap/secondary refinement;
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

- L4/L5 Close-up now visibly contains the `phi = 0` tick and blue secondary marker;
- the secondary marker size/color feels consistent with the orbit panels;
- horseshoe Close-up that crosses the wrap discontinuity looks identical to Full width horizontally;
- the L4/L5 anchored ticks remain useful after extending tadpole Close-up ranges to include `phi = 0`.

New questions to evaluate during the diagnostics stage include:

- whether the current-state and whole-trajectory diagnostics remain visually distinct enough;
- whether `H_gc`, `Delta H_gc`, and validity quantities need stronger category labels;
- whether the custom X/Y selectors remain usable on narrow screens;
- whether automatic axis formatting is readable across variables with very different numerical scales.

These questions do not change the physical definitions.

---

## Next recommended task

Inspect the latest phase-space refinements in a real browser. If they are accepted, implement the reusable diagnostic-data layer first, then add synchronized current-state diagnostics followed by the custom X-Y plot.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.