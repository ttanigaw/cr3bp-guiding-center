# State-Plot Specification

Last updated: 2026-09-15

## Purpose

This document records the concrete behavior of the version-0.1 state plots. It complements `docs/APP_SPEC.md`, which requires radial, angular, and phase-space views, `docs/DIAGNOSTICS_SPEC.md`, which defines the planned diagnostic-data architecture and custom X-Y plot, and `docs/PHYSICS.md`, which remains authoritative for the underlying variables and dynamics.

All behavior described here is display-only. It must not modify the stored numerical trajectory, solver, diagnostics, or shared animation time.

---

## Shared animation marker

The `r(t)`, `phi(t)`, and `phi` versus `r - 1` plots all use the same current trajectory point selected by the application's shared animation time.

Each plot displays that current state with the same bright-green marker family used for the third body in the orbit panels.

Playback, pause, reset, and recalculation therefore move or reset all plot markers synchronously with the rotating and inertial orbit panels.

The planned custom X-Y diagnostic plot will follow the same rule.

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

The secondary is shown in this panel at its rotating-frame polar position

`(phi, r - 1) = (0, -mu)`

using the same blue marker family as the secondary in the rotating and inertial orbit panels. The displayed vertical range must include this marker.

The viewer has two independent choices:

1. vertical scale: **Magnify** or **1:1 scale**;
2. horizontal range: **Full width** or **Close-up**.

The physical panel width remains fixed in all combinations.

### Vertical scale: Magnify

This is the default vertical behavior formerly labeled `Auto fit`.

- the phase-space SVG has the normal fixed plot height;
- the vertical range is fitted to contain the plotted `r - 1` data while retaining `r - 1 = 0` and the secondary marker;
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
- current marker, secondary marker, and path use the same scaling transformation.

### Horizontal range: Full width

- fixed wrapped interval `-180 deg` to `+180 deg`;
- physical plot width remains fixed;
- the standard five horizontal ticks are `-180`, `-90`, `0`, `90`, and `180` degrees.

### Horizontal range: Close-up

Close-up keeps the physical plot width fixed while contracting the numerical `phi` range around the trajectory when that can be represented as one continuous wrapped interval.

- the relevant Lagrange longitude, `phi = +60 deg` for an L4-like trajectory or `phi = -60 deg` for an L5-like trajectory, is always included;
- the relevant L4/L5 point is plotted at `(phi, r - 1) = (+/-60 deg, 0)` using the same purple marker styling as the orbit panels;
- this marker is shown or hidden by the shared **L4 / L5 points** control in the upper `Display layers` panel;
- a vertical reference/grid line and numeric label are always shown at the relevant `+60` or `-60` degree longitude;
- all other horizontal grid ticks are equally spaced relative to that L4/L5 longitude; the Lagrange longitude need not be at the horizontal center;
- the close-up range is padded, rounded outward to convenient 5-degree limits, and constrained to the wrapped interval;
- a minimum angular span is retained.

If the trajectory crosses the wrapped-angle discontinuity at `+180 deg / -180 deg`, a single contracted numerical interval would be misleading. In that case selecting **Close-up** falls back to the same horizontal range and standard horizontal ticks as **Full width**, including the `phi = 0` tick.

In Close-up mode, vertical `r - 1` ticks are generated at equal intervals anchored to `r - 1 = 0`, so the existing dashed corotation line is a true grid anchor.

When **Close-up** and **1:1 scale** are selected together, the variable panel height is recomputed from the actual horizontal span. If Close-up has fallen back to Full width because the path crosses the wrap discontinuity, the Full-width span is used for that calculation.

---

## Planned custom X-Y diagnostic plot

Version 0.1 will add one additional plot panel whose horizontal and vertical variables can be selected independently by the viewer.

The detailed data definitions and implementation sequence are specified in `docs/DIAGNOSTICS_SPEC.md`.

The planned baseline behavior is:

- two selectors, one for X and one for Y;
- initial default `X = t`, `Y = Delta H_gc`;
- selectable quantities including `t`, `r`, `r - 1`, wrapped `phi`, `r2`, `epsilon_tide`, `H_gc`, `Delta H_gc`, `|Delta H_gc|`, `dot r`, `dot phi`, and `|dot r / r|`;
- full calculated trajectory shown as a thin line;
- one current-position marker driven by the existing shared animation time;
- automatic numeric axis ranges appropriate to the selected variables;
- optional subdued zero/reference lines where a variable has a meaningful neutral value;
- no second integration and no effect on the stored trajectory;
- no progressive trail mode in the first implementation.

If wrapped `phi` is selected for either axis, path construction must split at wrap discontinuities rather than drawing across `+180 deg` and `-180 deg`.

The specialized **Magnify / 1:1 scale** and **Full width / Close-up** controls remain specific to the fixed `phi` versus `r - 1` panel and are not part of the initial generic custom-plot controls.

---

## Rendering and sampling

For rendering performance, long trajectories may be uniformly downsampled for SVG path construction while preserving the final trajectory point.

This render-only sampling does not change the numerical solution, current-state interpolation, diagnostics, or stored trajectory.

The current marker is always taken from the shared animation-time interpolation of the full trajectory rather than from the downsampled display path.