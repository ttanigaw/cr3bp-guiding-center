# Project State

Last updated: 2026-09-14

## Current phase

Guiding-center physics core, fixed-step RK4 integration, representative co-orbital presets, static rotating-frame visualization, editable initial conditions, and basic trajectory diagnostics are implemented.

The application computes trajectories in the browser from either validated presets or user-edited `mu`, `r0`, `phi0`, and `tMax`. Calculation occurs only when the user explicitly presses Calculate. Physics, integration, diagnostics, presets, and visualization remain separated by module boundaries.

The visualization specification has now been extended so that version 0.1 should show the same reduced trajectory in both rotating and inertial frames before shared animation is added.

---

## Repository status

The maintained project documents are:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`

`README.md` includes local development and Codespaces instructions.

React + TypeScript + Vite, Vitest, and a Node.js 24.20.0 dev container are configured. Dependencies are pinned with an npm lockfile. GitHub Actions CI runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not configured.

The earlier Codespaces permission failure was fixed by removing `USER node` from the Dockerfile while keeping `remoteUser: node` in `devcontainer.json`. A fresh Codespace started normally, and `npm run dev` served the application successfully in a real browser.

---

## Physics model status

The guiding-center model is documented in `docs/PHYSICS.md`.

The current reduced model evolves the guiding-center radius `r` and rotating-frame co-orbital angle `phi`. The reduced radial coordinate is a guiding-center radius rather than the instantaneous physical radius of the full PCR3BP trajectory.

The physical document already defines the inertial azimuth by

`theta = phi + t`

in the adopted nondimensional units with binary angular frequency equal to unity. Therefore the planned inertial-frame panel requires only a coordinate transformation of the existing reduced trajectory; it does not introduce a second dynamical model or a second integration.

The model remains provisional until quantitatively compared with the full PCR3BP.

---

## Application specification status

Version 0.1 is defined in `docs/APP_SPEC.md`.

Implemented portions include:

- direct input of `mu`, `r0`, `phi0` in degrees, and integration duration;
- explicit Calculate action;
- reduced guiding-center integration;
- static rotating-frame trajectory visualization;
- primary and secondary markers;
- corotation circle;
- L4 and L5 markers;
- validated horseshoe/L4/L5 preset loading;
- numerical failure reporting;
- reduced-Hamiltonian drift diagnostic;
- minimum-secondary-distance diagnostic.

Version 0.1 now also requires:

- a companion inertial-frame view of the same reduced trajectory;
- synchronized rotating/inertial animation using one shared animation time;
- `r(t)` visualization;
- angular evolution visualization;
- `phi` versus `r - 1` phase-space visualization;
- current-state diagnostics during animation;
- static deployment suitable for GitHub Pages.

Full PCR3BP comparison remains deferred and is conceptually separate from rotating-versus-inertial visualization of the reduced model.

---

## Implementation status

Implemented:

- responsive React application layout;
- strict TypeScript checking and Vite configuration;
- Vitest unit, regression, and DOM tests;
- `src/physics/guidingCenter.ts` for the reduced physical model;
- `src/physics/integrator.ts` for fixed-step RK4 integration;
- `src/physics/diagnostics.ts` for trajectory diagnostics;
- `src/physics/presets.ts` for validated example trajectories;
- `src/components/TrajectoryPlot.tsx` for static equal-axis rotating-frame SVG rendering;
- editable physical controls and explicit Calculate workflow in `App.tsx`;
- clear user-facing calculation errors while retaining the last successful trajectory.

The trajectory SVG downsamples long paths for rendering only; the numerical solution is not modified.

The next implementation should introduce a pure rotating-to-inertial coordinate transform before adding any inertial rendering logic. The transform should be independent of React and separately unit-tested.

---

## Numerical method status

A transparent fixed-step classical fourth-order Runge-Kutta integrator is implemented.

The requested `dt` is used for full steps, and the final step is shortened when necessary so the trajectory ends exactly at `tMax`.

The current UI uses fixed `dt = 0.05`; this numerical setting is displayed but is not yet user-editable. The final user-facing time-step/tolerance policy remains open.

The inertial-frame view must reuse the already calculated trajectory and must not trigger another numerical integration.

---

## Representative orbit presets

All current presets use `mu = 0.001`.

- Horseshoe: `r0 = 1.02`, `phi0 = pi`, `dt = 0.05`, `tMax = 250`.
- L4 tadpole: `r0 = 1`, `phi0 = +80 deg`, `dt = 0.05`, `tMax = 160`.
- L5 tadpole: `r0 = 1`, `phi0 = -80 deg`, `dt = 0.05`, `tMax = 160`.

These are reproducible demonstration cases for the reduced model, not universal physical initial conditions.

---

## Visualization status

The rotating-frame visualization is implemented as an equal-axis SVG using

- `x = r cos(phi)`;
- `y = r sin(phi)`;
- primary at `(-mu, 0)`;
- secondary at `(1 - mu, 0)`;
- corotation circle `r = 1`;
- L4/L5 markers at the standard rotating-frame triangular coordinates.

The new specification adds a companion inertial-frame view using

- `theta = phi + t`;
- `X = r cos(theta)`;
- `Y = r sin(theta)`.

At `t = 0`, the rotating and inertial axes coincide. In the inertial panel the primary and secondary rotate counterclockwise with angular frequency 1. If L4/L5 markers are shown there, they rotate with the binary as well.

The rotating and inertial panels should have similar visual weight and should be adjacent on sufficiently wide screens. On narrow screens they may stack, but should remain adjacent in reading order.

For animation, both frame panels must share a single animation time. The rotating panel may show the full path in a subdued style. Because the inertial path overlaps itself after many binary revolutions, the preferred inertial animation uses the current position plus a recent trail or otherwise subdued accumulated path.

The current implementation remains static and rotating-frame only.

---

## Validation status

GitHub Actions automatically repeats `npm ci`, `npm test`, and `npm run build` on pull requests and pushes to `main`.

Physics-core validation includes analytic-derivative finite-difference checks, exact `mu = 0` limits, reflection symmetry, body-distance checks, and input-domain checks.

Integrator validation includes reproduction of the analytic `mu = 0` solution, exact landing on `tMax`, reduced-Hamiltonian conservation, and rejection of invalid integration settings.

Representative-orbit validation covers horseshoe topology, bounded L4/L5 tadpole topology, reduced-Hamiltonian conservation, and a close-approach proxy through `epsilon_tide`.

A fresh Codespace and the rotating-frame horseshoe/L4/L5 displays were inspected successfully in a real desktop browser. DOM tests also exercise the Calculate workflow, diagnostics rendering, and invalid-input errors.

The next validation tasks are:

1. unit-test the rotating-to-inertial coordinate transform, including the `t = 0` identity and one-quarter-period rotation cases;
2. inspect the static inertial-frame panel next to the rotating panel in a real browser;
3. verify layout at a narrow viewport;
4. only then add and validate shared animation.

---

## Deployment status

GitHub is the canonical project repository.

The intended deployment target is GitHub Pages. GitHub Pages has not yet been configured.

---

## Known issues and open questions

The following issues remain open:

- choose the final user-facing time step or integration tolerance policy;
- determine how approximation-validity warnings should be presented;
- choose the default inertial-frame trail length/display style during animation;
- quantify the accuracy of the guiding-center approximation near horseshoe U-turns;
- define a low-free-eccentricity initialization procedure for future full-PCR3BP comparison;
- decide whether the SVG implementation remains sufficient once multiple diagnostic plots are added.

No hard validity threshold for close encounters has been adopted yet. The preset `epsilon_tide` bounds are regression guards, not physical validity thresholds.

---

## Next recommended task

Before animation, add a pure and tested rotating-to-inertial coordinate transformation and a static inertial-frame companion panel for the already calculated reduced trajectory.

After both static frame views are validated in the browser, implement one shared animation clock that drives the current position in both frame panels and later the `r(t)`, wrapped `phi(t)`, phase-space, and current-state diagnostic markers.

---

## Session handoff rule

Before ending any substantial development session, update this file with what was completed, what remains incomplete, known bugs or concerns, numerical or physical validation results, and the next recommended task.

Do not rely on Codex session history, ChatGPT conversation history, or an uncommitted Codespace state to preserve project context. The GitHub repository is the persistent record of the project.
