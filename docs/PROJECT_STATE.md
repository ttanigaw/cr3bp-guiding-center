# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, rotating/inertial visualizations, synchronized animation, synchronized fixed state plots, three phase-space horizontal-range modes, viewer-selectable display layers, reusable diagnostic data, synchronized current diagnostics, and the user-selectable Custom X-Y diagnostic plot are implemented on `main`.

The main diagnostics-stage implementation is now substantially complete. No governing equation, integration algorithm, stored trajectory, or playback-time definition was changed by the diagnostics/custom-plot work.

The next immediate step is a real-browser review of the new diagnostics and Custom X-Y plot. If accepted, version-0.1 work moves to documentation polish and static deployment.

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

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/DIAGNOSTICS_SPEC.md` defines the diagnostics architecture. `docs/PLOT_SPEC.md` records the concrete fixed-plot and Custom X-Y plot behavior.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Accepted fixed visualization baseline

The rotating/inertial orbit panels and fixed lower plots remain the accepted display baseline.

The fixed `phi` versus `r - 1` panel provides:

- vertical choices **Magnify** and **1:1 scale**;
- horizontal choices **Full width**, **Close-up with origin**, and **Close-up**;
- wrap-safe fallback to Full width when the trajectory crosses `+180 deg / -180 deg`;
- the secondary at `(phi, r - 1) = (0, -mu)` whenever the selected horizontal range contains the origin;
- L4 at `(+60 deg, 0)` and L5 at `(-60 deg, 0)` whenever each lies inside the displayed range and **L4 / L5 points** is enabled.

Concrete behavior is documented in `docs/PLOT_SPEC.md`.

---

## Diagnostic data layer on main

PR #38 added `src/diagnostics/diagnosticData.ts` and was merged at `0d66be9ee1f8487515242a7902bf1a2ce80dac87` after GitHub Actions passed tests and build.

For each stored or interpolated trajectory state, the shared data layer derives:

- `t` and binary periods;
- `r` and `r - 1`;
- raw `phi` and wrapped `phi` in degrees;
- secondary distance `r2`;
- `epsilon_tide = mu / r2^3`;
- reduced Hamiltonian `H_gc`;
- `Delta H_gc = H_gc(t) - H_gc(0)` and `|Delta H_gc|`;
- `dot r` and `dot phi`;
- `|dot r / r|`.

All physical quantities reuse the authoritative helpers in `src/physics/guidingCenter.ts`; UI code does not duplicate the equations.

The whole-trajectory summary now uses the same diagnostic definitions as current-state values and custom plotting.

---

## Synchronized Diagnostics panel on main

PR #39 added the current Diagnostics UI and was merged at `a3d091f038fe2b8bbbcf96b220f5e2c32441689c` after GitHub Actions passed tests and build.

The panel is separated into four conceptual groups.

### Current state

Synchronized to shared animation time:

- `t`;
- `r`;
- wrapped `phi`;
- `r2`.

### Numerical conservation

- current `H_gc`;
- current `Delta H_gc`;
- whole-trajectory `max |Delta H_gc|`.

The UI explicitly states that Hamiltonian conservation tests numerical integration of the reduced model and does not by itself validate the guiding-center approximation.

### Approximation validity

Displayed as continuous indicators without undocumented hard thresholds:

- `epsilon_tide`;
- `|dot r / r|`;
- `dot r`;
- `dot phi`.

### Whole trajectory

- minimum secondary distance;
- calculated duration in binary periods;
- integration point count.

The current-state values advance with Play and return to their initial values on Reset.

---

## Custom X-Y diagnostic plot on main

PR #41 added the Custom X-Y plot and was merged at `4cdf46f91128b14ffa0987e2144f83fc9632d706` after GitHub Actions passed both tests and build.

The panel has independent X and Y selectors. Initial defaults are:

- `X = t`;
- `Y = Delta H_gc`.

Selectable variables are:

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

Behavior:

- the full calculated curve is shown as a thin blue line;
- a bright-green marker follows the same shared animation time as the orbit panels and fixed plots;
- changing X or Y is display-only and does not recalculate the orbit;
- axis ranges are recomputed automatically for the selected variables;
- useful reference values such as `r = 1`, `r - 1 = 0`, and `Delta H_gc = 0` are shown as subdued reference lines;
- when wrapped `phi` is selected on either axis, the curve is split at `+180 deg / -180 deg` discontinuities;
- long curves may be downsampled for SVG path rendering only; the current marker and diagnostics still use the full trajectory/current interpolation.

The registry for selectable variables owns the stable key, label, axis label, accessor, tick formatting, minimum display span, and optional reference value.

Concrete behavior is documented in `docs/PLOT_SPEC.md`.

---

## Validation status

The diagnostics/custom-plot tests now verify:

- diagnostic quantities reuse the authoritative physics functions;
- `Delta H_gc = 0` at the initial trajectory point;
- `epsilon_tide = mu / r2^3`;
- wrapped display `phi` does not alter raw `phi`;
- whole-trajectory extrema match the shared diagnostic data;
- current diagnostics follow shared playback and Reset;
- the Custom X-Y registry contains the planned version-0.1 variables;
- selecting wrapped `phi` splits the custom curve at wrap discontinuities;
- changing custom X/Y variables changes the displayed curve without changing the integration-point count;
- the Custom X-Y current marker follows shared playback.

PR #38, PR #39, and PR #41 all passed GitHub Actions with `npm test` and `npm run build` successful before merge.

---

## Still required for version 0.1

Remaining work is:

1. real-browser review of the synchronized Diagnostics panel and Custom X-Y plot for horseshoe, L4, and L5 presets;
2. adjust diagnostic number formatting, density, axis formatting, or selector layout if browser review shows a usability problem;
3. refine approximation-validity presentation only if needed; do not introduce unsupported hard thresholds;
4. refresh README usage documentation;
5. configure and verify static GitHub Pages deployment.

Full PCR3BP comparison remains deferred until the reduced model has been validated further.

---

## Browser-review questions

For Diagnostics, check:

- whether Current state, Numerical conservation, Approximation validity, and Whole trajectory are visually distinct enough;
- whether `H_gc`, `Delta H_gc`, `epsilon_tide`, `dot r`, and `dot phi` formatting is readable;
- whether `dot r` and `dot phi` should remain visible by default or later move primarily into the Custom plot.

For the Custom X-Y plot, check:

- whether the X/Y selectors are easy to use and readable on the normal desktop layout;
- whether the default `t` versus `Delta H_gc` view makes conservation error understandable;
- whether automatic ranges remain readable for very small values such as `Delta H_gc`;
- whether `phi` wrap splitting looks natural for horseshoe trajectories;
- whether reference lines are useful without becoming visually distracting;
- whether the panel remains usable on narrower screens.

These are presentation questions only; the physical definitions remain fixed by `docs/PHYSICS.md` and `docs/DIAGNOSTICS_SPEC.md`.

---

## Next recommended task

Review the Diagnostics panel and Custom X-Y plot in a real browser using the horseshoe, L4 tadpole, and L5 tadpole presets. If the presentation is accepted, refresh README and proceed to static GitHub Pages deployment for version 0.1.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
