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

## Rotating-frame trajectory

The rotating-frame reduced trajectory remains visible as a complete path for context by default.

Its line is intentionally thinner than in the first prototype so it does not dominate the body markers, coordinate overlays, and Lagrange geometry.

The inertial `+X/+Y` axes continue to be shown in rotating-frame coordinates and therefore rotate clockwise with angle `-t`.

---

## Third-body marker and pulse

The current third-body marker in both frame panels uses a bright orange fill with no outline. The same orange color family is used for all third-body afterimages and the inertial fading trail.

The marker uses a smooth visual pulse with a one-second display cycle. The pulse is deliberately asymmetric:

- brightening occurs relatively quickly near the start of the cycle;
- dimming is slower over the remainder of the cycle;
- the marker remains visible at minimum brightness rather than switching fully off.

This pulse is a visual cue only and is independent of the numerical integration.

Users who request reduced motion through their operating-system/browser preference should receive a non-pulsing marker.

The secondary body uses a blue fill so that it remains clearly distinguishable from the orange third body.

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

In addition to the three discrete afterimages, the inertial panel displays a thin orange trail covering the most recent `4T/12 = T/3` of binary time.

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
- inertial frame: **Axes**.

All display layers are enabled by default. The current third-body marker, primary, secondary, reference/corotation circle, playback state, and numerical data remain visible regardless of these layer toggles.

When a layer is hidden, its matching legend item should also be hidden so the legend describes only currently visible optional layers.

---

## Browser-validation questions

After this design is merged, browser review should focus on:

1. whether the dark theme improves readability without becoming decorative noise;
2. whether the digital-style playback numerals remain stable and readable;
3. whether the orange third body is sufficiently distinct from the blue secondary;
4. whether the one-second asymmetric pulse feels smooth rather than like hard blinking;
5. whether all three afterimages are easy to distinguish during normal playback in both frames;
6. whether rotating-frame afterimage overlap remains readable and unobtrusive;
7. whether the `3/4`, `2/4`, `1/4` brightness progression is visually useful;
8. whether the inertial `4T/12` fading trail decays smoothly enough and disappears naturally at its oldest end;
9. whether the thin orange trail remains subordinate to the current marker and discrete afterimages;
10. whether the shared versus panel-specific grouping of display controls is immediately understandable;
11. whether the active/inactive toggle styling is clear without competing visually with the plots.
