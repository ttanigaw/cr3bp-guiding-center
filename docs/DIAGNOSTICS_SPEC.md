# Diagnostics and Custom-Plot Specification

Last updated: 2026-09-16

## Purpose

This document defines the version-0.1 diagnostics architecture and the user-selectable X-Y diagnostic plot for the reduced guiding-center application.

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

The application monitors both `H_gc` and `Delta H_gc`.

`Delta H_gc` is a numerical-conservation diagnostic: a small value indicates that the numerical integration is respecting the conserved quantity of the reduced Hamiltonian system.

It does **not** demonstrate that the guiding-center approximation is physically accurate.

### Relationship to the full PCR3BP Jacobi integral

The full PCR3BP has the Jacobi integral / Jacobi constant. That conserved quantity belongs to the future full-PCR3BP model and should not be presented as though it were the conserved quantity of the current reduced integration.

When a full-PCR3BP mode is implemented later, the diagnostics framework should be extended with `C_J` and `Delta C_J` alongside the reduced-model `H_gc` diagnostics.

---

## 2. Diagnostic categories

The UI explicitly separates three concepts.

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

No universal hard validity threshold should be imposed in version 0.1. These are displayed as continuous quantities with explanatory wording.

A later warning layer may summarize them qualitatively, but only after the chosen thresholds or categories have a documented physical basis.

---

## 3. Shared diagnostic-data layer

A single reusable diagnostic-data layer derives quantities from a trajectory sample and `mu`.

For each stored trajectory point, the data layer can provide at least:

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

The implementation reuses the analytic physics functions already present in `src/physics/` rather than duplicating equations in UI code.

The same definitions feed:

- current-state diagnostics;
- whole-trajectory diagnostics;
- the custom X-Y plot;
- future validity warnings.

This avoids inconsistent values between panels.

---

## 4. Current-state diagnostics panel

The Diagnostics area is separated into current-state, numerical-conservation, approximation-validity, and whole-trajectory sections.

### Current state

Values synchronized to the shared animation time include initially:

- `t`;
- `r`;
- wrapped `phi`;
- `r2`;
- `epsilon_tide`;
- `H_gc`;
- `Delta H_gc`;
- `|dot r / r|`.

These values update whenever the shared animation marker moves, including during Play, Reset, and recalculation.

### Whole trajectory

The trajectory-summary diagnostics include:

- `max |Delta H_gc|`;
- minimum `r2`;
- integration duration in binary periods;
- integration point count.

Additional extrema such as maximum `epsilon_tide` or maximum `|dot r / r|` may be added if they prove useful, but they should not crowd the UI unnecessarily.

---

## 5. Custom X-Y diagnostic plot

Version 0.1 includes one additional plot panel in which the viewer can independently choose the horizontal and vertical variables.

The purpose is to let the same calculated trajectory be explored as either a time series or a parametric curve without adding a separate fixed panel for every useful combination.

### 5.1 Selectable variables

The implementation offers:

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

The variable registry stores, for each variable:

- a stable internal key;
- a user-facing label;
- units / nondimensional status where relevant;
- a value accessor;
- a preferred numeric formatter;
- optional reference value such as `r = 1`, `r - 1 = 0`, or `Delta H_gc = 0`;
- a fallback display span used only when the plotted range is effectively degenerate.

This registry is shared by axis selectors and plotting logic.

### 5.2 Initial default

The initial default is:

- X axis: `t`;
- Y axis: `Delta H_gc`.

This makes conservation of the reduced Hamiltonian visible immediately while still allowing the viewer to select other relationships.

### 5.3 Plot behavior

The custom plot:

- draws the full calculated trajectory as a thin line;
- displays a current-position marker synchronized to the same shared animation time as every other panel;
- keeps Play, Pause, Reset, and recalculation synchronized with the existing plots;
- uses display-only downsampling if needed for rendering performance;
- computes the current marker from the full trajectory/current interpolated state rather than from a downsampled display sample;
- labels both axes from the selected variable metadata;
- automatically recomputes plot limits when either selected variable changes.

The first implementation does not use an additional progressive-trail mode. The full curve plus synchronized current marker matches the existing fixed state plots.

### 5.4 Wrapped-angle discontinuities

If wrapped `phi` is selected for either axis, the line must not draw an artificial segment across the `+180 deg / -180 deg` discontinuity.

The same wrapped-angle convention documented for the fixed `phi(t)` and phase-space plots is reused.

### 5.5 Reference lines

Where a selected variable has a physically useful reference value, the plot may show a subdued reference line. Initial examples are:

- `r = 1`;
- `r - 1 = 0`;
- `Delta H_gc = 0`;
- `dot r = 0`;
- `dot phi = 0`.

Reference lines are display aids only and must not be interpreted as warning thresholds.

### 5.6 Linear auto-range and tick generation

Linear custom axes use one general auto-fit rule rather than variable-specific special cases.

1. The required range is determined from the actual plotted minimum and maximum plus the optional reference value.
2. If that required range has a resolved finite width, the actual data span is respected; a variable's fallback span does **not** force the axis to be wider.
3. A small display padding is added. When a reference value is already an outer boundary, that boundary remains fixed rather than adding empty space beyond the reference.
4. Only when the required range is effectively degenerate is the variable's fallback span used to create a finite visible range.
5. Ticks then use equal spacing chosen from simple `1`, `2`, or `5` multiples of a power of ten.

A range is considered effectively degenerate when it is exactly zero-width or when its width is negligible relative to a nonzero baseline. This prevents quantities such as an almost constant `H_gc` or `r` from being magnified into meaningless floating-point-scale variations, while allowing genuinely small quantities centered near zero, such as `Delta H_gc`, to be displayed at their actual scale.

If the displayed range contains zero:

- `0` must be a labeled tick;
- all other ticks on that axis are placed at equal intervals relative to zero;
- the axis range need not be symmetric about zero.

If zero is outside the displayed range, the same nice-number spacing is used without forcing zero into the plot.

The zero-cleanup tolerance used when constructing ticks is proportional to the selected tick interval, so physically resolved values much smaller than `1e-14` are not collapsed to zero merely because of their absolute magnitude.

### 5.7 Independent Linear / log10 axis scales

Each custom axis has its own scale selector with:

- `Linear` as the default;
- `log10` as an optional display transformation.

The X and Y choices are independent.

`log10` is enabled only if every stored value of the selected variable is finite and strictly positive. If any plotted value is zero or negative, `log10` is disabled for that axis. The implementation must not silently omit nonpositive samples to create a logarithmic plot.

When `log10` is active:

- the plotted coordinate is `log10(value)`;
- tick labels show the transformed logarithmic values themselves;
- the axis title explicitly reads `log10(variable)`;
- a reference line is shown only when the reference value is positive;
- if a variable change or recalculation makes the current log scale invalid, that axis reverts to Linear.

The existing logarithmic minimum transformed span is retained for version 0.1 so the linear auto-fit refinement does not alter already accepted log10 behavior.

The fixed `phi` versus `r - 1` panel keeps its own specialized `Magnify / 1:1 scale` and horizontal-range controls; those controls are not reused for the generic custom plot.

---

## 6. Implementation sequence status

Completed diagnostics-stage work:

1. reusable diagnostic data model and tests;
2. synchronized current diagnostics;
3. Custom X-Y diagnostic plot;
4. zero-anchored nice linear ticks and independent Linear / log10 axis controls;
5. resolved-span linear auto-fit with fallback only for effectively degenerate data.

Remaining version-0.1 work is browser review, presentation refinement if needed, README refresh, and static deployment.

---

## 7. Testing requirements

Tests should verify:

- `H_gc` and `Delta H_gc` are derived from the authoritative physics function;
- `Delta H_gc = 0` at the first trajectory point;
- `epsilon_tide = mu / r2^3`;
- `|dot r / r|` uses the same analytic reduced equations as the solver;
- current diagnostics follow the shared animation time;
- changing custom X/Y selectors changes axis labels and path data but does not recalculate the orbit;
- the custom current marker moves with shared animation time;
- wrapped-phi custom plots split across wrap discontinuities;
- display-only sampling does not change current diagnostics or extrema;
- a linear axis containing zero labels zero and uses equal nice-number spacing around it;
- a tiny but resolved nonzero span is fitted to the data instead of being expanded to the fallback span;
- an effectively constant nonzero-baseline quantity uses the fallback span;
- exactly constant data still receive a finite display range;
- ordinary finite-width ranges are not unnecessarily widened by the fallback span;
- `log10` is disabled for variables containing nonpositive values;
- independent log10 axes transform coordinates and clearly label the transformed axis;
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
