# State-Plot Specification

Last updated: 2026-09-15

## Purpose

This document records the concrete behavior of the version-0.1 state plots. It complements `docs/APP_SPEC.md`, which requires radial, angular, and phase-space views, and `docs/PHYSICS.md`, which remains authoritative for the underlying variables and dynamics.

All behavior described here is display-only. It must not modify the stored numerical trajectory, solver, diagnostics, or shared animation time.

---

## Shared animation marker

The `r(t)`, `phi(t)`, and `phi` versus `r - 1` plots all use the same current trajectory point selected by the application's shared animation time.

Each plot displays that current state with the same bright-green marker family used for the third body in the orbit panels.

Playback, pause, reset, and recalculation therefore move or reset all plot markers synchronously with the rotating and inertial orbit panels.

---

## Radial evolution: `r(t)`

The radial plot shows the reduced guiding-center radius `r` against nondimensional time `t`.

- horizontal axis: nondimensional `t`;
- vertical axis: guiding-center `r`;
- the full calculated trajectory is shown as a thin blue line;
- `r = 1` is shown as a dashed reference line;
- the vertical scale is chosen from the calculated trajectory while always retaining `r = 1` in view;
- this is the guiding-center radius, not an instantaneous radial coordinate from a full PCR3BP orbit.

---

## Angular evolution: wrapped `phi(t)`

The display convention is

`-180 deg < phi <= 180 deg`,

or equivalently `-pi < phi <= pi` internally.

- horizontal axis: nondimensional `t`;
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

The viewer has two independent choices:

1. vertical scale: **Magnify** or **1:1 scale**;
2. horizontal range: **Full width** or **Close-up**.

The physical panel width remains fixed in all combinations.

### Vertical scale: Magnify

This is the default vertical behavior formerly labeled `Auto fit`.

- the phase-space SVG has the normal fixed plot height;
- the vertical range is fitted to contain the plotted `r - 1` data while retaining `r - 1 = 0`;
- displayed limits are expanded outward to simple 1-2-5-style values, for example `0.064 -> 0.1`.

The name `Magnify` emphasizes that this mode enlarges the vertical variation for readability rather than preserving the physical x/y scale ratio.

### Vertical scale: 1:1 scale

For display scaling only, define

`y_display = (r - 1) * 180 / pi`.

The plot height is varied so that one unit of `phi` in degrees and one unit of `y_display` occupy the same physical screen length.

- physical horizontal plot width is unchanged;
- selected horizontal `phi` range determines the horizontal scale;
- only vertical plot height changes;
- vertical tick labels remain physical `r - 1` values;
- current marker and path use the same scaling transformation.

### Horizontal range: Full width

- fixed wrapped interval `-180 deg` to `+180 deg`;
- physical plot width remains fixed.

### Horizontal range: Close-up

Close-up keeps the physical plot width fixed while contracting the numerical `phi` range around the trajectory.

- the relevant Lagrange longitude, `phi = +60 deg` for an L4-like trajectory or `phi = -60 deg` for an L5-like trajectory, is always included;
- the relevant L4/L5 point is plotted at `(phi, r - 1) = (+/-60 deg, 0)` using the same purple marker styling as the orbit panels;
- this marker is shown or hidden by the shared **L4 / L5 points** control in the upper `Display layers` panel;
- a vertical reference/grid line and numeric label are always shown at the relevant `+60` or `-60` degree longitude;
- all other horizontal grid ticks are equally spaced relative to that L4/L5 longitude; the Lagrange longitude need not be at the horizontal center;
- the close-up range is padded, rounded outward to convenient 5-degree limits, and constrained to the wrapped interval;
- a minimum angular span is retained.

In Close-up mode, vertical `r - 1` ticks are likewise generated at equal intervals anchored to `r - 1 = 0`, so the existing dashed corotation line is a true grid anchor.

When **Close-up** and **1:1 scale** are selected together, the variable panel height is recomputed from the narrowed horizontal span so the physical 1:1 relation remains valid.

---

## Rendering and sampling

For rendering performance, long trajectories may be uniformly downsampled for SVG path construction while preserving the final trajectory point.

This render-only sampling does not change the numerical solution, current-state interpolation, diagnostics, or stored trajectory.

The current marker is always taken from the shared animation-time interpolation of the full trajectory rather than from the downsampled display path.
