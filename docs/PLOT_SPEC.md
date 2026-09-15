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

The initial version uses a single documented wrapping convention:

`-180 deg < phi <= 180 deg`.

Equivalently in radians:

`-pi < phi <= pi`.

The plot uses degrees for user-facing display while the solver continues to use radians internally.

- horizontal axis: nondimensional `t`;
- vertical axis: wrapped `phi` in degrees;
- the vertical range is fixed to `-180` through `+180` degrees;
- a dashed `phi = 0` reference line is shown;
- when wrapping causes a jump between values near `+180` and `-180` degrees, the plotted line is split at that discontinuity rather than drawing an artificial line across the plot.

The wrapping operation is visualization-only and must never alter the stored trajectory angle.

---

## Reduced phase space: `phi` versus `r - 1`

The phase-space view uses:

- horizontal axis: wrapped `phi` in degrees, with the same `-180 deg < phi <= 180 deg` convention;
- vertical axis: `r - 1`;
- the full calculated trajectory is shown as a thin blue line;
- `r - 1 = 0` is shown as a dashed corotation reference line;
- line segments are split at the same wrapped-angle discontinuities used in `phi(t)` so the plot never connects `+180 deg` directly to `-180 deg`.

This plot is intended to make horseshoe, tadpole, and circulating behavior easier to distinguish.

---

## Rendering and sampling

For rendering performance, long trajectories may be uniformly downsampled for SVG path construction while preserving the final trajectory point.

This render-only sampling does not change the numerical solution, current-state interpolation, diagnostics, or stored trajectory.

The current marker is always taken from the shared animation-time interpolation of the full trajectory rather than from the downsampled display path.
