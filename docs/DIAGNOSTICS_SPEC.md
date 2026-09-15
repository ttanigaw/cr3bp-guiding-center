# Diagnostics and Custom-Plot Specification

Last updated: 2026-09-15

## Purpose

This document defines the planned version-0.1 diagnostics architecture and the planned user-selectable X-Y diagnostic plot for the reduced guiding-center application.

It complements:

- `docs/PHYSICS.md`, which remains authoritative for the physical model and the definitions of the reduced Hamiltonian and validity indicators;
- `docs/APP_SPEC.md`, which defines high-level application behavior;
- `docs/PLOT_SPEC.md`, which defines concrete state-plot behavior;
- `docs/PROJECT_STATE.md`, which records implementation status and next work.

Nothing in this document changes the governing equations. The diagnostics and plots described here are derived from the already calculated reduced trajectory.

---

## 1. Conserved quantity to monitor in the current reduced model

The current application integrates the reduced guiding-center system, not the full planar circular restricted three-body problem.

For the reduced model, the conserved quantity is the reduced Hamiltonian defined in `docs/PHYSICS.md`:

```math
H_{\rm gc}(r,\phi)
=
-\frac{1}{2r}
-\sqrt r
-\mathcal R(r,\phi).
```

Define

```math
\Delta H_{\rm gc}(t)
=
H_{\rm gc}(t)-H_{\rm gc}(0).
```

The application should monitor both `H_gc` and `Delta H_gc`.

`Delta H_gc` is a numerical-conservation diagnostic: a small value indicates that the numerical integration is respecting the conserved quantity of the reduced Hamiltonian system.

It does **not** demonstrate that the guiding-center approximation is physically accurate.

### Relationship to the full PCR3BP Jacobi integral

The full PCR3BP has the Jacobi integral / Jacobi constant. That conserved quantity belongs to the future full-PCR3BP model and should not be presented as though it were the conserved quantity of the current reduced integration.

When a full-PCR3BP mode is implemented later, the diagnostics framework should be extended with `C_J` and `Delta C_J` alongside the reduced-model `H_gc` diagnostics.

---

## 2. Diagnostic categories

The UI should explicitly separate three concepts.

### 2.1 Current dynamical state

Quantities that describe the state selected by the shared animation time:

- `t`;
- binary periods `t / (2 pi)`;
- `r`;
- `r - 1`;
- wrapped `phi`;
- distance to the secondary `r2`.

### 2.2 Numerical-conservation diagnostics

Quantities that primarily test numerical integration quality:

- `H_gc`;
- `Delta H_gc`;
- `|Delta H_gc|`;
- whole-trajectory `max |Delta H_gc|`.

These values must be labeled as numerical diagnostics, not physical-validity scores.

### 2.3 Approximation-validity indicators

Quantities that help assess whether the reduced guiding-center approximation is being used in a well-controlled regime:

- `r2`;
- `epsilon_tide = mu / r2^3`;
- `dot r`;
- `|dot r / r|`;
- optionally `dot phi` where useful.

No universal hard validity threshold should be imposed in version 0.1. These should initially be displayed as continuous quantities with explanatory wording.

A later warning layer may summarize them qualitatively, but only after the chosen thresholds or categories have a documented physical basis.

---

## 3. Shared diagnostic-data layer

Before adding more UI, the implementation should create a single reusable diagnostic-data layer that derives quantities from a trajectory sample and `mu`.

For each stored trajectory point, the data layer should be able to provide at least:

- `t`;
- `r`;
- `rOffset = r - 1`;
- wrapped `phi` in degrees for display;
- the underlying unwrapped/raw `phi` in radians where needed internally;
- `r2`;
- `epsilonTide`;
- `hGc`;
- `deltaHGc`, relative to the first trajectory sample;
- `absDeltaHGc`;
- `rDot`;
- `phiDot`;
- `absRadialRate = |rDot / r|`.

The implementation should reuse the analytic physics functions already present in `src/physics/` rather than duplicating equations in UI code.

The same definitions must feed:

- current-state diagnostics;
- whole-trajectory diagnostics;
- the custom X-Y plot;
- future validity warnings.

This avoids inconsistent values between panels.

---

## 4. Current-state diagnostics panel

The existing Diagnostics area should evolve into clearly separated sections.

### Current state

Values synchronized to the shared animation time should include initially:

- `t`;
- `r`;
- wrapped `phi`;
- `r2`;
- `epsilon_tide`;
- `H_gc`;
- `Delta H_gc`;
- `|dot r / r|`.

These values should update whenever the shared animation marker moves, including during Play, Reset, and recalculation.

### Whole trajectory

The existing trajectory-summary diagnostics should remain available, including:

- `max |Delta H_gc|`;
- minimum `r2`;
- integration duration in binary periods;
- integration point count.

Additional extrema such as maximum `epsilon_tide` or maximum `|dot r / r|` may be added if they prove useful, but they should not crowd the initial UI unnecessarily.

---

## 5. Custom X-Y diagnostic plot

Version 0.1 should add one additional plot panel in which the viewer can independently choose the horizontal and vertical variables.

The purpose is to let the same calculated trajectory be explored as either a time series or a parametric curve without adding a separate fixed panel for every useful combination.

### 5.1 Initial selectable variables

The first implementation should offer at least:

- `t`;
- `r`;
- `r - 1`;
- wrapped `phi [deg]`;
- `r2`;
- `epsilon_tide`;
- `H_gc`;
- `Delta H_gc`;
- `|Delta H_gc|`;
- `dot r`;
- `dot phi`;
- `|dot r / r|`.

The variable registry should store, for each variable:

- a stable internal key;
- a user-facing label;
- units / nondimensional status where relevant;
- a value accessor;
- a preferred numeric formatter;
- optional reference value such as `r = 1`, `r - 1 = 0`, or `Delta H_gc = 0`.

This registry should be shared by axis selectors and plotting logic.

### 5.2 Initial default

A useful initial default is:

- X axis: `t`;
- Y axis: `Delta H_gc`.

This makes conservation of the reduced Hamiltonian visible immediately while still allowing the viewer to select other relationships.

### 5.3 Plot behavior

The custom plot should:

- draw the full calculated trajectory as a thin line;
- display a current-position marker synchronized to the same shared animation time as every other panel;
- keep Play, Pause, Reset, and recalculation synchronized with the existing plots;
- use display-only downsampling if needed for rendering performance;
- compute the current marker from the full trajectory/current interpolated state rather than from a downsampled display sample;
- label both axes from the selected variable metadata;
- automatically recompute plot limits when either selected variable changes.

The first implementation does not need an additional progressive-trail mode. The full curve plus synchronized current marker is the preferred baseline because it matches the existing fixed state plots.

### 5.4 Wrapped-angle discontinuities

If wrapped `phi` is selected for either axis, the line must not draw an artificial segment across the `+180 deg / -180 deg` discontinuity.

The same wrapped-angle convention already documented for the fixed `phi(t)` and phase-space plots should be reused.

### 5.5 Reference lines

Where a selected variable has a physically useful reference value, the plot may show a subdued reference line. Initial examples are:

- `r = 1`;
- `r - 1 = 0`;
- `Delta H_gc = 0`;
- `dot r = 0`;
- `dot phi = 0`.

Reference lines are display aids only and must not be interpreted as warning thresholds.

### 5.6 Axis scaling

The first implementation should use clear automatic numeric ranges for arbitrary variable pairs.

The existing specialized `Magnify / 1:1 scale` and `Full width / Close-up` controls belong to the fixed `phi` versus `r - 1` panel and should not automatically be copied into the generic custom plot.

Additional axis-range controls for the custom plot may be added later if repeated use shows a need.

---

## 6. Suggested implementation sequence

The next implementation work should proceed in the following order.

1. **Diagnostic data model and tests**
   - add reusable pure functions for the per-sample derived quantities;
   - verify `H_gc`, `Delta H_gc`, `r2`, `epsilon_tide`, and rate quantities against existing physics helpers;
   - ensure the `mu = 0` and existing conservation tests remain valid.

2. **Synchronized current diagnostics**
   - split the Diagnostics UI into current-state and whole-trajectory information;
   - drive current values from the existing shared animation time;
   - preserve the existing whole-trajectory summary.

3. **Custom X-Y diagnostic plot**
   - implement the variable registry and two axis selectors;
   - default to `t` versus `Delta H_gc`;
   - draw the full curve plus shared current marker;
   - reuse wrapped-angle discontinuity handling.

4. **Approximation-validity presentation**
   - display `r2`, `epsilon_tide`, and `|dot r / r|` clearly as validity indicators;
   - keep them distinct from conservation error;
   - do not add undocumented hard thresholds.

5. **Version-0.1 completion work**
   - final browser review across horseshoe, L4, and L5 presets;
   - update README usage documentation;
   - configure static GitHub Pages deployment.

---

## 7. Testing requirements

At minimum, tests should verify:

- `H_gc` and `Delta H_gc` are derived from the authoritative physics function;
- `Delta H_gc = 0` at the first trajectory point;
- `epsilon_tide = mu / r2^3`;
- `|dot r / r|` uses the same analytic reduced equations as the solver;
- current diagnostics follow the shared animation time;
- changing custom X/Y selectors changes axis labels and path data but does not recalculate the orbit;
- the custom current marker moves with shared animation time;
- wrapped-phi custom plots split across wrap discontinuities;
- display-only sampling does not change current diagnostics or extrema;
- numerical-conservation and validity quantities are not mislabeled as one another.

---

## 8. Future full-PCR3BP extension

The custom-plot and diagnostics architecture should be designed so a future full-PCR3BP model can add variables without replacing the UI framework.

Expected future variables include:

- rotating-frame `x`, `y`;
- rotating-frame velocities;
- inertial quantities where useful;
- Jacobi constant `C_J`;
- `Delta C_J`.

At that stage, the UI must clearly identify which conserved quantity belongs to which dynamical model:

- reduced guiding-center model: `H_gc`;
- full PCR3BP: Jacobi integral `C_J`.

Full-PCR3BP variables are explicitly outside the current version-0.1 implementation scope.