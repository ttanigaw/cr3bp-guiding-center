# Project State

Last updated: 2026-09-16

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, rotating/inertial visualizations, synchronized animation, fixed state plots, phase-space display controls, reusable diagnostic data, synchronized current diagnostics, and the selectable Custom X-Y diagnostic plot are implemented on `main`.

Recent browser-review refinements are also on `main`:

- Custom X-Y linear axes use zero-anchored nice ticks when zero lies in range;
- Custom X and Y axes independently support Linear / `log10` when the selected data are strictly positive;
- the fixed `phi` versus `r - 1` panel now uses a tighter zero-anchored vertical range and consistent zero-based ticks in all horizontal-range modes;
- very shallow 1:1 phase-space views use condensed endpoint-only vertical labels while retaining the dashed zero line;
- the phase-space control rows use a shared label column so the first `Magnify` and `Full width` buttons align horizontally;
- in the Custom X-Y controls, each axis places its `Scale` selector directly below its `Variable` selector while X and Y remain side by side on normal desktop widths;
- the fixed `r(t)` plot now anchors its vertical ticks to `r = 1` and uses equal 1-2-5-style nice spacing around corotation.

No governing equation, integration algorithm, stored trajectory, playback-time definition, or diagnostic quantity definition was changed by these display refinements.

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

`docs/PHYSICS.md` remains authoritative for the physical model. `docs/PLOT_SPEC.md` records concrete fixed-plot and Custom X-Y behavior. `docs/DIAGNOSTICS_SPEC.md` records the diagnostics architecture and Custom X-Y data/scale rules.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

---

## Fixed radial plot on main

The fixed `r(t)` plot shows the guiding-center radius against nondimensional time and retains the dashed `r = 1` corotation reference.

PR #49 refined the vertical-axis behavior and was merged to `main` at merge commit `a899cc49dffb57c9a2f6cad12b0eff25b05e7a9f` after CI passed.

The radial vertical axis now:

- derives its displayed range from the trajectory's `r - 1` excursion;
- always retains `r = 1` as the numerical reference;
- makes `r = 1` a labeled tick/grid anchor;
- places ticks above and below `r = 1` at equal 1-2-5-style nice intervals;
- rounds the displayed limits outward to simple values without requiring symmetry about `r = 1`;
- uses readable labels such as `0.98`, `0.99`, `1.00`, `1.01`, and `1.02` for a trajectory spanning roughly `0.982` through `1.018`.

Concrete behavior is documented in `docs/PLOT_SPEC.md`.

---

## Fixed phase-space panel on main

The fixed `phi` versus `r - 1` panel provides:

- vertical choices **Magnify** and **1:1 scale**;
- horizontal choices **Full width**, **Close-up with origin**, and **Close-up**;
- wrap-safe fallback to Full width when the trajectory crosses `+180 deg / -180 deg`;
- the secondary at `(phi, r - 1) = (0, -mu)` whenever the selected horizontal range contains the origin;
- L4 at `(+60 deg, 0)` and L5 at `(-60 deg, 0)` whenever each lies inside the displayed range and **L4 / L5 points** is enabled.

PR #45 refined the vertical-axis behavior and was merged to `main` at merge commit `c7db93c0675cb8be8ed3883fbe6f477eb0ace5d0` after CI passed.

The phase-space vertical axis now:

- always retains `r - 1 = 0` as the numerical reference;
- uses one 1-2-5-style interval and rounds both limits to multiples of that same interval;
- places ordinary vertical ticks at equal spacing anchored to zero for Full width and both Close-up modes;
- avoids unnecessarily coarse independent endpoint rounding, so a range such as approximately `[-0.018, 0.014]` can display as `[-0.020, 0.020]` rather than `[-0.050, 0.020]`;
- when a 1:1 plot becomes too shallow for normal tick labels, omits the numeric zero label, retains the dashed zero line, and displays only the upper/lower endpoint values with their labels displaced slightly apart for readability.

The phase-space display controls now align the first option button in each row: `Magnify` and `Full width` start at the same horizontal position. On narrow screens the controls may stack responsively.

Concrete behavior is documented in `docs/PLOT_SPEC.md`.

---

## Diagnostics and Custom X-Y plot on main

PR #38 added the reusable diagnostic-data layer. PR #39 added synchronized current-state diagnostics. PR #41 added the Custom X-Y plot. PR #43 refined Custom X-Y axis scaling and ticks.

The shared diagnostic layer derives:

- `t` and binary periods;
- `r` and `r - 1`;
- raw and wrapped `phi`;
- `r2`;
- `epsilon_tide`;
- `H_gc`, `Delta H_gc`, and `|Delta H_gc|`;
- `dot r`, `dot phi`, and `|dot r / r|`.

The Diagnostics panel keeps numerical-conservation quantities distinct from approximation-validity indicators.

The Custom X-Y plot supports independent X/Y selection among:

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

Default axes remain `X = t`, `Y = Delta H_gc`.

Linear custom axes use 1-2-5-style equal tick spacing and include a labeled zero tick whenever zero is in range.

Each Custom X-Y axis independently supports **Linear** and **log10**. `log10` is enabled only when every stored value on that axis is finite and strictly positive; no nonpositive samples are silently removed. In log mode, coordinates and labels use the base-10 transformed value and the axis title explicitly reads `log10(variable)`.

For control layout, X and Y remain separate axis columns on normal desktop widths. Within each axis column, `Scale` is placed directly below `Variable`; the two controls no longer occupy the same row.

---

## Validation status

PR #45 passed GitHub Actions with both tests and build successful before merge.

PR #47 was a CSS/layout-only refinement and passed the existing `npm test` and `npm run build` CI checks before merge to `main` at merge commit `1577329be6827eb484ec883f564ea00af09c9093`.

PR #49 passed GitHub Actions with both `npm test` and `npm run build` successful before merge to `main` at merge commit `a899cc49dffb57c9a2f6cad12b0eff25b05e7a9f`.

New radial-plot coverage verifies that a trajectory spanning approximately `0.982 <= r <= 1.018` uses a `0.98` through `1.02` display range with labels `0.98`, `0.99`, `1.00`, `1.01`, and `1.02`, and retains the `r = 1` reference line.

New phase-space tests verify:

- the tighter zero-anchored radial-offset range, including `[-0.018, 0.014] -> [-0.020, 0.020]`;
- Full-width Magnify includes zero as a vertical tick and keeps equal spacing around it;
- a very shallow Full-width 1:1 plot shows only the two endpoint labels, omits numeric zero, and still renders the zero reference line.

Earlier diagnostics/custom-plot tests continue to cover the shared diagnostic definitions, wrapped-phi splitting, selector behavior, log-scale eligibility, zero-anchored Custom X-Y ticks, and shared playback-marker synchronization.

---

## Still required for version 0.1

Remaining work is:

1. real-browser review of the refined `r(t)` vertical ticks together with the phase-space and Custom X-Y refinements for horseshoe, L4, and L5 presets;
2. adjust remaining number formatting, label density, or selector layout only if browser review shows a usability issue;
3. refine approximation-validity presentation only if needed; do not introduce unsupported hard thresholds;
4. refresh README usage documentation;
5. configure and verify static GitHub Pages deployment.

Full PCR3BP comparison remains deferred until the reduced model has been validated further.

---

## Next recommended task

Review the latest fixed-plot and control refinements in a real browser, especially:

- `r(t)` uses `r = 1` as a labeled vertical tick/grid anchor with equal nice spacing;
- `Magnify` and `Full width` start at the same horizontal position;
- Custom X/Y `Scale` appears directly below the corresponding `Variable`;
- Full width + Magnify retains zero-anchored equal phase-space vertical ticks;
- Full width + 1:1 retains endpoint-only labels without overlap;
- both Close-up modes + Magnify retain a tight vertical range without clipping the trajectory.

If these are acceptable, proceed to README refresh and static GitHub Pages deployment for version 0.1.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
