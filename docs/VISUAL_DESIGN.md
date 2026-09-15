# Visualization Design

Last updated: 2026-09-15

## Purpose

This document records concrete visual and animation choices for the current browser prototype. It complements `docs/APP_SPEC.md`, which defines the higher-level application behavior, and `docs/PHYSICS.md`, which remains authoritative for the physical model.

All choices in this file are display-only. They must not alter the numerical trajectory, governing equations, diagnostics, or stored RK4 samples.

---

## Overall theme

The application uses a dark, space-like presentation:

- the page background is near-black with restrained blue/violet radial glows and sparse star-like points;
- application cards use very dark backgrounds with low-contrast blue-gray borders;
- orbit SVG panels use a black background;
- labels, axes, geometry guides, trajectories, and markers use brighter high-contrast colors selected for readability on black;
- decoration must remain subordinate to the physical visualization.

---

## Playback time display

The changing numerical parts of the playback status use a monospaced digital-style font stack with tabular numerals and fixed minimum widths so later text does not shift as digits change.

A seven-segment-style font name (`DSEG7` / compatible names) is preferred when available in the browser environment. No external web-font dependency is required by the current prototype; ordinary monospaced fonts are used as fallbacks.

---

## Rotating-frame trajectory and inertial trajectory overlay

The rotating-frame reduced trajectory remains available as a complete path for context.

Its line is intentionally thin so it does not dominate the body markers, coordinate overlays, and Lagrange geometry. The current refinement makes this line slightly thinner again.

The inertial panel now also has a panel-local **Trajectory** switch. This does **not** draw the time-history curve obtained by transforming every stored sample with that sample's own time. Instead, it draws the same complete rotating-frame orbit shape as a rigid overlay and rotates the entire shape with the current binary phase.

For a rotating-frame sample `(r_i, phi_i)` and current display time `t`, the overlay position is constructed from

`X_i = r_i cos(phi_i + t)`

`Y_i = r_i sin(phi_i + t)`.

The same current `t` is applied to every point of the shape. Therefore the overlay remains phase-locked to the binary/secondary and rotates as one rigid figure. It is an explanatory display layer, not an inertial-frame time-history trajectory and not a second integration.

The inertial `+X/+Y` axes continue to be shown in rotating-frame coordinates and therefore rotate clockwise with angle `-t` in the rotating panel.

---

## Third-body marker and pulse

The current third-body marker in both frame panels uses a bright green fill with no outline. The same green color family is used for all third-body afterimages and the inertial fading trail.

The marker uses a smooth visual pulse with a one-second display cycle. The pulse is deliberately asymmetric:

- brightening occurs relatively quickly near the start of the cycle;
- dimming is slower over the remainder of the cycle;
- the marker remains visible at minimum brightness rather than switching fully off.

This pulse is a visual cue only and is independent of the numerical integration.

Users who request reduced motion through their operating-system/browser preference should receive a non-pulsing marker.

The secondary body remains blue so that it is clearly distinguishable from the bright-green third body.

---

## Discrete third-body afterimages

Both the rotating and inertial panels display up to three discrete past-position markers for the third body at fixed offsets based on the binary period `T = 2 pi`:

- afterimage 1: `T/12` in the past;
- afterimage 2: `2T/12` in the past;
- afterimage 3: `3T/12` in the past.

Before enough trajectory history exists, an afterimage whose requested past time is earlier than the trajectory start is omitted rather than clamped to `t = 0`.

The afterimages use the same pulse waveform as the current marker, with pulse phases delayed by the corresponding fractions of the one-second pulse cycle:

- afterimage 1: `1/12` cycle delay;
- afterimage 2: `2/12` cycle delay;
- afterimage 3: `3/12` cycle delay.

Their peak visual strengths are scaled relative to the current marker:

- afterimage 1: `3/4`;
- afterimage 2: `2/4`;
- afterimage 3: `1/4`.

In the rotating frame these markers may nearly overlap because the guiding center moves slowly there. That overlap is expected and should not be artificially separated.

These markers are derived by display-time interpolation of the already computed trajectory. They never feed back into physics calculations or diagnostics.

---

## Inertial fading trail

In addition to the three discrete afterimages, the inertial panel displays a thin green trail covering the most recent `4T/12 = T/3` of binary time.

The trail is rendered as short line segments so opacity can vary continuously with age along a curved trajectory:

- near the current third-body position, the trail has its maximum display opacity;
- opacity decreases smoothly for older segments;
- at exactly `4T/12` in the past, the intended opacity is zero;
- the trail is thin and visually secondary to the current marker and the three discrete afterimages.

This is a display-time reconstruction from the existing trajectory only. It is not smoothing, filtering, or a modification of the numerical orbit.

---

## Lagrange geometry and axes

The primary-secondary-L4 and primary-secondary-L5 equilateral-triangle guides are available in both frame panels as faint auxiliary geometry.

In the inertial panel, fixed `+X/+Y` directions are available as emphasized arrows and labels. In the rotating panel, the inertial `+X/+Y` axes are available in rotating-frame coordinates.

The geometry guides and axes should remain visually secondary to the trajectory and body markers.

---

## Display-layer controls

Viewers can selectively hide or show explanatory drawing layers without changing the numerical solution or animation state.

Shared controls are placed above and outside the two orbit panels so it is clear that they act on both frames. The shared controls are:

- **Afterimages**: toggles all three discrete third-body afterimages in both panels and simultaneously toggles the inertial fading trail;
- **L4 / L5 points**: toggles the L4 and L5 point markers in both panels with one control;
- **L4 / L5 triangles**: toggles both primary-secondary-L4/L5 triangle guides in both panels.

Panel-specific controls are placed inside the corresponding panel header:

- rotating frame: **Trajectory** and **Axes**;
- inertial frame: **Trajectory** and **Axes**.

All display layers are enabled by default. The current third-body marker, primary, secondary, reference/corotation circle, playback state, and numerical data remain visible regardless of these layer toggles.

When a layer is hidden, its matching legend item should also be hidden so the legend describes only currently visible optional layers.

---

## Legend ordering

The legends in both orbit panels prioritize objects that cannot be hidden. Their leading order is:

1. Primary;
2. Secondary;
3. Current position;
4. `-1/12 period`;
5. `-2/12 period`;
6. `-3/12 period`.

Optional entries such as Trajectory, Fading trail, and L4/L5 follow those entries when visible. If afterimages are disabled, their three legend entries are simply omitted without changing the priority of Primary, Secondary, and Current position.

---

## Browser-validation questions

After this design is merged, browser review should focus on:

1. whether the bright-green third body is sufficiently distinct from the blue secondary and blue trajectory;
2. whether the thinner trajectory line remains easy to follow;
3. whether the inertial Trajectory overlay is clearly understood as a rigidly rotating rotating-frame orbit shape rather than an inertial time-history path;
4. whether the inertial trajectory overlay remains correctly phase-locked to the secondary throughout playback;
5. whether the shared versus panel-specific grouping of display controls remains immediately understandable;
6. whether the revised legend ordering makes the stable physical objects easier to scan;
7. whether the inertial `4T/12` fading trail remains visually subordinate to the marker and discrete afterimages.
