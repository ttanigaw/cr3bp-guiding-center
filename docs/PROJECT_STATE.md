# Project State

Last updated: 2026-09-16

## Current phase

The reduced guiding-center physics core, fixed-step RK4 integration, validated horseshoe/L4/L5 presets, editable initial conditions, rotating/inertial visualizations, synchronized animation, synchronized fixed state plots, three phase-space horizontal-range modes, viewer-selectable display layers, reusable diagnostic data, synchronized current diagnostics, and the user-selectable Custom X-Y diagnostic plot are implemented on `main`.

The latest browser review identified two Custom X-Y readability needs, both now implemented on `main`:

1. zero-anchored nice-number ticks for linear axes;
2. independent Linear / `log10` scale selection for X and Y.

No governing equation, integration algorithm, stored trajectory, playback-time definition, or diagnostic quantity definition was changed by this refinement.

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

## Accepted fixed visualization baseline

The rotating/inertial orbit panels and fixed lower plots remain the accepted display baseline.

The fixed `phi` versus `r - 1` panel provides:

- vertical choices **Magnify** and **1:1 scale**;
- horizontal choices **Full width**, **Close-up with origin**, and **Close-up**;
- wrap-safe fallback to Full width when the trajectory crosses `+180 deg / -180 deg`;
- the secondary at `(phi, r - 1) = (0, -mu)` whenever the selected horizontal range contains the origin;
- L4 at `(+60 deg, 0)` and L5 at `(-60 deg, 0)` whenever each lies inside the displayed range and **L4 / L5 points** is enabled.

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

---

## Custom X-Y linear-axis behavior

Linear custom axes now use equal tick spacing chosen from simple `1`, `2`, or `5` multiples of powers of ten.

If the displayed range contains zero:

- zero is always a labeled tick;
- the other ticks are equally spaced relative to zero;
- the axis range itself need not be symmetric about zero.

This addresses the browser-review case where a zero reference line was visible but the tick labels were offset from zero.

---

## Custom X-Y log10 behavior

Each Custom X-Y axis has an independent scale selector:

- **Linear** — default;
- **log10**.

`log10` is enabled only if every stored value for the selected axis is finite and strictly positive.

If any value is zero or negative:

- the `log10` option is disabled;
- no samples are silently removed;
- if a variable change or recalculation invalidates an already selected log scale, that axis returns to Linear.

In `log10` mode:

- coordinates use `log10(value)`;
- tick labels show the transformed logarithmic value;
- the axis title explicitly reads `log10(variable)`;
- only positive reference values can produce reference lines.

X and Y scale modes are independent.

---

## Validation status

PR #43 passed GitHub Actions with both `npm test` and `npm run build` successful before merge to `main` at merge commit `da460e56d4be38bc476193f18d56bfc5745e2ecc`.

New tests verify:

- a linear range containing zero generates a zero tick and equal nice-number spacing;
- one-sided nonnegative ranges retain zero cleanly at the boundary;
- `log10` availability requires every value to be strictly positive;
- log coordinates use the base-10 transformed value;
- positive reference values remain usable in log mode;
- nonpositive data are rejected for log layout;
- Custom X/Y scale controls default to Linear;
- nonpositive variables expose `log10` as unavailable;
- a positive variable can switch to `log10` and receives an explicit `log10(...)` axis title;
- changing from a logarithmic positive variable to a signed variable automatically returns the axis to Linear;
- signed `dot r` / `dot phi` custom axes include a zero tick with equal intervals;
- selector changes still do not change integration-point count;
- wrapped-phi splitting and shared playback-marker synchronization continue to work.

---

## Still required for version 0.1

Remaining work is:

1. real-browser review of the refined Custom X-Y tick placement and Linear / `log10` controls for horseshoe, L4, and L5 presets;
2. adjust diagnostic number formatting, density, axis formatting, or selector layout if browser review shows another usability issue;
3. refine approximation-validity presentation only if needed; do not introduce unsupported hard thresholds;
4. refresh README usage documentation;
5. configure and verify static GitHub Pages deployment.

Full PCR3BP comparison remains deferred until the reduced model has been validated further.

---

## Browser-review questions

For the refined Custom X-Y plot, check:

- signed pairs such as `dot r` versus `dot phi` show a clearly labeled zero and evenly spaced ticks around it;
- `r`, `r2`, or positive `epsilon_tide` cases behave naturally in `log10` mode;
- the `log10(variable)` axis title is unambiguous;
- disabled `log10` options for quantities containing zero/negative values are understandable;
- X/Y variable and scale controls remain readable at normal desktop width and on narrower screens.

These are presentation questions only; the physical definitions remain fixed by `docs/PHYSICS.md`.

---

## Next recommended task

Review the refined Custom X-Y plot in a real browser. If accepted, refresh README and proceed to static GitHub Pages deployment for version 0.1.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
