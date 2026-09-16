# State-Plot Specification

Last updated: 2026-09-16

## Purpose

This document records the concrete behavior of the version-0.1 state plots. It complements `docs/APP_SPEC.md`, which requires radial, angular, and phase-space views, `docs/DIAGNOSTICS_SPEC.md`, which defines the diagnostic-data architecture and custom X-Y plot, and `docs/PHYSICS.md`, which remains authoritative for the underlying variables and dynamics.

All behavior described here is display-only. It must not modify the stored numerical trajectory, solver, diagnostics, or shared animation time.

---

## Shared animation marker

The `r(t)`, `phi(t)`, `phi` versus `r - 1`, and Custom X-Y plots all use the same current trajectory point selected by the application's shared animation time.

Each plot displays that current state with the same bright-green marker family used for the third body in the orbit panels.

Playback, pause, reset, and recalculation therefore move or reset all plot markers synchronously with the rotating and inertial orbit panels.

### Fixed time-series horizontal axis

The fixed `r(t)` and wrapped `phi(t)` panels share the same nondimensional-time horizontal axis.

- the left edge is anchored at `t = 0`;
- tick spacing is chosen from convenient `1`, `2`, or `5` multiples of a power of ten;
- ticks are equally spaced from `t = 0`;
- the displayed right edge is rounded outward to the first such tick that contains the calculated maximum time;
- therefore the right edge does not need to coincide exactly with the integration endpoint.

For example, if the calculated trajectory ends at `t = 230`, both fixed time-series panels display `0, 50, 100, 150, 200, 250`. If the trajectory ends exactly at `t = 250`, the same ticks are used with the right edge at `250`.

This is a display-only extension of the horizontal plotting range; the stored trajectory still ends at its requested integration time.

---

## Radial evolution: `r(t)`

The radial plot shows the reduced guiding-center radius `r` against nondimensional time `t`.

- horizontal axis: nondimensional `t`, using the shared fixed time-series rule above;
- vertical axis: guiding-center `r`;
- the full calculated trajectory is shown as a thin blue line;
- `r = 1` is shown as a dashed reference line;
- the vertical range is derived from the calculated `r - 1` excursion while always retaining `r = 1`;
- `r = 1` is a true vertical tick/grid anchor;
- vertical ticks above and below `r = 1` are equally spaced using a convenient 1-2-5-style interval;
- displayed limits are rounded outward to simple values and need not be symmetric about `r = 1`;
- this is the guiding-center radius, not an instantaneous radial coordinate from a full PCR3BP orbit.

For a trajectory spanning roughly `0.982 <= r <= 1.018`, a typical display is `0.98` through `1.02` with ticks such as `0.98`, `0.99`, `1.00`, `1.01`, and `1.02`, rather than ticks offset from the corotation reference.

---

## Angular evolution: wrapped `phi(t)`

The display convention is

`-180 deg < phi <= 180 deg`,

or equivalently `-pi < phi <= pi` internally.

- horizontal axis: nondimensional `t`, using the shared fixed time-series rule above;
- vertical axis: wrapped `phi` in degrees;
- vertical range: fixed `-180` through `+180` degrees;
- dashed reference line at `phi = 0`;
- wrap jumps are split rather than connected across the plot.

The wrapping operation is visualization-only and never modifies the stored trajectory angle.

---

## Reduced phase space: `phi` versus `r - 1`

The phase-space view uses:

- horizontal axis: wrapped `phi` in degrees;
- vertical axis: `r - 1`;
- thin blue trajectory line;
- dashed corotation reference at `r - 1 = 0`;
- the same wrapped-angle discontinuity splitting used in `phi(t)`.

The secondary has rotating-frame polar coordinates

`(phi, r - 1) = (0, -mu)`.

When `phi = 0` lies inside the selected horizontal range, the secondary is shown with the same blue marker family as the secondary in the rotating and inertial orbit panels. When a Close-up range excludes `phi = 0`, the secondary is outside the visible phase-space window and is not drawn there. The vertical range only needs to include `r - 1 = -mu` when the secondary is horizontally visible.

The viewer has two independent choices:

1. vertical scale: **Magnify** or **1:1 scale**;
2. horizontal range: **Full width**, **Close-up with origin**, or **Close-up**.

The physical panel width remains fixed in all combinations.

### Shared vertical-range and tick rule

The phase-space vertical axis always retains `r - 1 = 0` in its numerical range.

The plotted `r - 1` data, plus the visible secondary when relevant, determine the required lower and upper extent. A single convenient 1-2-5-style tick interval is chosen from that required span, and both displayed limits are rounded outward to multiples of that same interval.

Consequently:

- the vertical range remains as tight as practical instead of independently rounding each endpoint to a coarser magnitude;
- `r - 1 = 0` is a true tick/grid anchor whenever ordinary tick labels are shown;
- vertical ticks above and below zero are equally spaced;
- the same rule applies to Full width, Close-up with origin, and Close-up.

For example, data contained within approximately `[-0.018, 0.014]` may use a vertical range of `[-0.020, 0.020]` rather than expanding unnecessarily to `[-0.050, 0.020]`.

### Vertical scale: Magnify

This is the default vertical behavior formerly labeled `Auto fit`.

- the phase-space SVG has the normal fixed plot height;
- the vertical range is fitted tightly using the shared zero-anchored rule above;
- if the secondary is horizontally visible, the vertical range also contains `r - 1 = -mu`;
- vertical ticks are equally spaced about the `r - 1 = 0` anchor, though the displayed upper and lower limits need not be symmetric.

The name `Magnify` emphasizes that this mode enlarges the vertical variation for readability rather than preserving the physical x/y scale ratio.

### Vertical scale: 1:1 scale

For display scaling only, define

`y_display = (r - 1) * 180 / pi`.

The plot height is varied so that one unit of `phi` in degrees and one unit of `y_display` occupy the same physical screen length.

- physical horizontal plot width is unchanged;
- selected horizontal `phi` range determines the horizontal scale;
- only vertical plot height changes;
- vertical tick labels remain physical `r - 1` values;
- current marker, visible reference markers, and path use the same scaling transformation.

When the resulting vertical plotting height becomes too shallow for ordinary tick labels to remain legible:

- the dashed `r - 1 = 0` reference line remains visible;
- the numeric `0` label is omitted;
- only the displayed vertical minimum and maximum are labeled;
- those two endpoint labels are displaced slightly outward from their exact line positions to prevent text overlap.

This condensed labeling changes only annotation placement, not the 1:1 geometry.

### Horizontal range: Full width

- fixed wrapped interval `-180 deg` to `+180 deg`;
- physical plot width remains fixed;
- the standard five horizontal ticks are `-180`, `-90`, `0`, `90`, and `180` degrees.

### Horizontal range: Close-up with origin

This mode keeps the physical plot width fixed while contracting the numerical `phi` range around the trajectory, subject to two anchors:

- `phi = 0` is always included;
- the relevant Lagrange longitude, `phi = +60 deg` for an L4-like trajectory or `phi = -60 deg` for an L5-like trajectory, is also included.

The horizontal ticks remain equally spaced relative to the selected relevant Lagrange longitude. The Lagrange longitude need not be at the horizontal center.

### Horizontal range: Close-up

This mode also keeps the physical plot width fixed while contracting the numerical `phi` range around the trajectory, but unlike **Close-up with origin** it does not force `phi = 0` into view.

- the relevant Lagrange longitude, `phi = +60 deg` for an L4-like trajectory or `phi = -60 deg` for an L5-like trajectory, is always included;
- the horizontal ticks are equally spaced relative to that selected Lagrange longitude;
- `phi = 0` and the secondary may lie outside the visible range;
- the Lagrange longitude need not be at the horizontal center.

For both Close-up modes, the numerical range is padded, rounded outward to convenient 5-degree limits, constrained to the wrapped interval, and given a minimum angular span.

### Wrap fallback for both Close-up modes

If the trajectory crosses the wrapped-angle discontinuity at `+180 deg / -180 deg`, a single contracted numerical interval would be misleading. In that case both **Close-up with origin** and **Close-up** fall back to the same horizontal range and standard horizontal ticks as **Full width**.

Thus, for a wrapping trajectory, all three horizontal-range selections are identical horizontally.

When either Close-up mode is combined with **1:1 scale**, panel height is recomputed from the actual displayed horizontal span. If the Close-up mode has fallen back to Full width because the path crosses the wrap discontinuity, the Full-width span is used for that calculation.

### L4/L5 point markers in phase space

The phase-space panel follows the shared upper **L4 / L5 points** display switch.

When that switch is on:

- L4 is represented at `(phi, r - 1) = (+60 deg, 0)`;
- L5 is represented at `(phi, r - 1) = (-60 deg, 0)`;
- each point is drawn with the same purple marker family used in the rotating and inertial orbit panels **if and only if that longitude lies inside the current horizontal range**.

Therefore Full width normally shows both L4 and L5, while a narrow L4 or L5 Close-up may show only the point that lies inside its current range.

When the shared **L4 / L5 points** switch is off, neither phase-space Lagrange point is drawn.

For a non-wrapping Close-up view, the selected relevant Lagrange longitude remains the vertical reference/grid anchor even if the other Lagrange point also happens to fall inside the displayed range.

---

## Custom X-Y diagnostic plot

Version 0.1 includes one additional plot panel whose horizontal and vertical variables can be selected independently by the viewer.

The detailed data definitions are specified in `docs/DIAGNOSTICS_SPEC.md`.

Current baseline behavior is:

- two variable selectors, one for X and one for Y;
- initial default `X = t`, `Y = Delta H_gc`;
- selectable quantities: `t`, `r`, `r - 1`, wrapped `phi`, `r2`, `epsilon_tide`, `H_gc`, `Delta H_gc`, `|Delta H_gc|`, `dot r`, `dot phi`, and `|dot r / r|`;
- the full calculated trajectory is shown as a thin blue curve;
- one bright-green current-position marker is driven by the existing shared animation time;
- axis ranges are recomputed automatically when either selected variable changes;
- subdued reference lines are shown where the selected variable definition has a useful reference value, including `r = 1`, `r - 1 = 0`, `Delta H_gc = 0`, `dot r = 0`, and `dot phi = 0`;
- selector changes and scale-mode changes are display-only and do not trigger a second integration or alter the stored trajectory;
- no progressive-trail mode is used in the initial implementation.

### Custom linear-axis range and ticks

Each linear custom axis uses one shared auto-fit rule.

- the required numerical range comes from the actual plotted data plus an optional reference value;
- if that range has a resolved finite width, the actual data span controls the display and is not forced to a variable-specific minimum width;
- a small padding is added, except that a reference value already forming an outer boundary remains fixed at that edge;
- a variable-specific fallback span is used only when the required range is effectively degenerate;
- ticks use equal spacing based on simple `1`, `2`, or `5` multiples of a power of ten.

"Effectively degenerate" means either zero width or a width negligible relative to a nonzero baseline. This avoids magnifying near-constant offset quantities such as `H_gc` or `r` down to meaningless floating-point noise, while allowing genuinely small near-zero quantities such as `Delta H_gc` to be viewed at their real scale.

When the displayed numerical range contains zero:

- `0` is always a labeled tick;
- all other ticks on that axis are placed at equal intervals relative to zero;
- the display range does not need to be symmetric about zero.

This prevents a zero reference line from falling between unrelated tick values and makes signed quantities such as `dot r` and `dot phi` easier to read.

When zero is not inside the displayed range, the same nice-number spacing is used without forcing zero into view.

Tick cleanup near zero is relative to the chosen tick interval rather than to a fixed absolute threshold, so resolved values below `1e-14` remain visible when that is the natural scale of the selected quantity.

### Custom axis scale mode

X and Y each have an independent scale selector:

- **Linear** — default;
- **log10** — plot the base-10 logarithm of the selected quantity.

`log10` is available only when **every stored plotted value for that axis is finite and strictly positive**. If the selected variable contains zero or negative values, the `log10` option is disabled. If recalculation or a variable change makes a previously logarithmic axis ineligible, that axis returns to Linear.

In log10 mode:

- plotting coordinates are transformed with `log10(value)`;
- tick labels show the transformed logarithmic value itself;
- the axis title explicitly changes to `log10(variable)` so the transformation is unambiguous;
- a reference value is shown only if that reference is positive and therefore has a defined logarithm.

No samples are silently dropped to make a logarithmic plot possible. The existing transformed minimum span is retained in version 0.1 so this linear auto-fit refinement does not alter already accepted log10 behavior.

If wrapped `phi` is selected for either axis, path construction splits at wrap discontinuities rather than drawing across `+180 deg` and `-180 deg`.

The variable registry owns the stable key, user-facing label, axis label, accessor, tick formatter, fallback display span, and optional reference value for each selectable quantity.

The specialized **Magnify / 1:1 scale** and **Full width / Close-up with origin / Close-up** controls remain specific to the fixed `phi` versus `r - 1` panel and are not copied into the generic custom plot.

---

## Rendering and sampling

For rendering performance, long trajectories may be uniformly downsampled for SVG path construction while preserving the final trajectory point.

This render-only sampling does not change the numerical solution, current-state interpolation, diagnostics, or stored trajectory.

The current marker is always taken from the shared animation-time interpolation of the full trajectory rather than from the downsampled display path.