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

The rotating-frame reduced trajectory remains visible as a complete path for context.

Its line is intentionally thinner than in the first prototype so it does not dominate the body markers, coordinate overlays, and Lagrange geometry.

The inertial `+X/+Y` axes continue to be shown in rotating-frame coordinates and therefore rotate clockwise with angle `-t`.

---

## Third-body current-position pulse

The current third-body marker in both frame panels uses a smooth visual pulse with a one-second display cycle.

The pulse is deliberately asymmetric:

- brightening occurs relatively quickly near the start of the cycle;
- dimming is slower over the remainder of the cycle;
- the marker remains visible at minimum brightness rather than switching fully off.

This pulse is a visual cue only and is independent of the numerical integration.

Users who request reduced motion through their operating-system/browser preference should receive a non-pulsing marker.

---

## Inertial-frame afterimages

The previous continuous recent-trail line is no longer used in the inertial panel.

Instead, the panel displays up to three discrete past-position markers for the third body at fixed offsets based on the binary period `T = 2 pi`:

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

These markers are derived by display-time interpolation of the already computed trajectory. They never feed back into physics calculations or diagnostics.

---

## Lagrange geometry and axes

The primary-secondary-L4 and primary-secondary-L5 equilateral-triangle guides remain visible in both frame panels as faint auxiliary geometry.

In the inertial panel, fixed `+X/+Y` directions remain emphasized with arrows and labels.

The geometry guides and axes should remain visually secondary to the trajectory and body markers.

---

## Browser-validation questions

After this design is merged, browser review should focus on:

1. whether the dark theme improves readability without becoming decorative noise;
2. whether the digital-style playback numerals remain stable and readable;
3. whether the rotating-frame trajectory line is thin enough but still easy to follow;
4. whether the one-second asymmetric pulse feels smooth rather than like hard blinking;
5. whether all three afterimages are easy to distinguish during normal playback;
6. whether the `3/4`, `2/4`, `1/4` brightness progression is visually useful;
7. whether the afterimage phase delays communicate motion naturally at the available playback speeds.
