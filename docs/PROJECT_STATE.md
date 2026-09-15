# Project State

Last updated: 2026-09-15

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, rotating/inertial visualizations, synchronized animation, synchronized fixed state plots, three phase-space horizontal-range modes, and viewer-selectable display layers are implemented on `main`.

The diagnostics stage has now started. Two planned steps are complete:

1. a reusable diagnostic-data layer shared by trajectory summaries and future plots;
2. current-state diagnostics synchronized to the shared animation time.

The next planned implementation task is the user-selectable Custom X-Y diagnostic plot.

No governing equation, integration algorithm, stored trajectory, or playback-time definition was changed by the diagnostics work.

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

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/DIAGNOSTICS_SPEC.md` defines the diagnostics architecture and Custom X-Y plot plan. GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Current phase-space behavior

The fixed `phi` versus `r - 1` panel remains the accepted baseline.

Vertical scale choices:

- **Magnify**;
- **1:1 scale**.

Horizontal range choices:

- **Full width**;
- **Close-up with origin**;
- **Close-up**.

Both Close-up modes fall back to the Full-width horizontal display when the trajectory crosses the `+180 deg / -180 deg` wrap discontinuity.

The phase-space panel also shows:

- the secondary at `(phi, r - 1) = (0, -mu)` whenever the selected horizontal range contains the origin;
- L4 at `(+60 deg, 0)` and L5 at `(-60 deg, 0)` whenever each point lies inside the displayed range and the shared **L4 / L5 points** layer is enabled.

Concrete behavior is documented in `docs/PLOT_SPEC.md`.

---

## Diagnostic data layer on main

PR #38 added `src/diagnostics/diagnosticData.ts` and was merged to `main` at merge commit `0d66be9ee1f8487515242a7902bf1a2ce80dac87` after GitHub Actions passed tests and build.

For each trajectory/current sample, the shared data layer derives:

- `t`;
- binary periods;
- `r`;
- `r - 1`;
- raw `phi`;
- wrapped `phi` in degrees;
- secondary distance `r2`;
- `epsilon_tide = mu / r2^3`;
- reduced Hamiltonian `H_gc`;
- `Delta H_gc = H_gc(t) - H_gc(0)`;
- `|Delta H_gc|`;
- `dot r`;
- `dot phi`;
- `|dot r / r|`.

All physical quantities are derived through the existing authoritative helpers in `src/physics/guidingCenter.ts`; the UI does not duplicate the equations.

The existing whole-trajectory diagnostics now consume this shared layer, so `max |Delta H_gc|` and minimum `r2` use the same definitions as current-state and future custom-plot data.

Angle wrapping was moved to reusable helpers in `src/math/angles.ts`; the existing state plots reuse those same helpers.

---

## Current-state diagnostics on main

PR #39 added the synchronized diagnostics UI and was merged to `main` at merge commit `a3d091f038fe2b8bbbcf96b220f5e2c32441689c` after GitHub Actions passed tests and build.

The Diagnostics panel is now separated into four conceptual groups.

### Current state

Synchronized to the shared animation time:

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

## Validation status

The current diagnostics work adds tests that verify:

- the diagnostic layer uses the authoritative `bodyDistances`, `tidalParameter`, `reducedHamiltonian`, and `guidingCenterRates` definitions;
- `Delta H_gc = 0` at the first trajectory point;
- `epsilon_tide = mu / r2^3`;
- wrapped display `phi` does not alter raw `phi`;
- the existing whole-trajectory summary matches extrema computed from the shared data layer;
- empty trajectories are rejected;
- current diagnostics move with the shared animation time;
- Reset restores the initial current diagnostics.

PR #38 and PR #39 both passed GitHub Actions with `npm test` and `npm run build` successful before merge.

---

## Planned Custom X-Y diagnostic plot

The next implementation target is one additional plot panel with independent X and Y selectors.

Initial selectable variables remain:

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

The planned default is `X = t`, `Y = Delta H_gc`.

The full calculated curve should be visible together with a bright-green current marker synchronized to the same animation time as the orbit panels and fixed state plots. Wrapped-phi discontinuities must be split rather than connected across `+180 deg / -180 deg`.

The custom plot must be display-only and must not trigger a second integration.

Detailed behavior remains specified in `docs/DIAGNOSTICS_SPEC.md` and `docs/PLOT_SPEC.md`.

---

## Still required for version 0.1

Remaining work is:

1. real-browser review of the new current diagnostics layout and values;
2. Custom X-Y diagnostic plot;
3. browser review of custom plotting for horseshoe, L4, and L5 presets;
4. refine approximation-validity presentation only if needed; do not introduce unsupported hard thresholds;
5. README refresh;
6. static GitHub Pages deployment.

Full PCR3BP comparison remains deferred until the reduced model has been validated further.

---

## Browser-review questions

For the new Diagnostics panel, check:

- whether Current state, Numerical conservation, Approximation validity, and Whole trajectory are visually distinct enough;
- whether the number formatting for `H_gc`, `Delta H_gc`, `epsilon_tide`, and rate quantities is readable;
- whether the panel feels too dense before the Custom X-Y plot is added;
- whether `dot r` and `dot phi` are useful enough to keep visible by default or should later move primarily into the Custom plot.

These are presentation questions only; the underlying definitions are fixed by `docs/PHYSICS.md` and `docs/DIAGNOSTICS_SPEC.md`.

---

## Next recommended task

Review the synchronized Diagnostics panel in a real browser. If the presentation is acceptable, implement the Custom X-Y diagnostic plot using the already merged shared diagnostic-data layer.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
