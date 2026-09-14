# Project State

Last updated: 2026-09-14

## Current phase

Guiding-center physics core, fixed-step RK4 integration, representative co-orbital presets, and the first static rotating-frame trajectory visualization are implemented.

The application now computes validated preset trajectories in the browser and renders them in an equal-axis rotating-frame SVG view. Physics, integration, presets, and visualization remain separated by module boundaries.

The immediate infrastructure task is to verify that a fresh GitHub Codespace starts successfully after the dev-container permission fix described below. After that, the next application task is to add user-editable physical controls and diagnostics before animation.

---

## Repository status

The following project documents have been prepared:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`

`README.md` includes local development and Codespaces instructions.

React + TypeScript + Vite, Vitest, and a Node.js 24.20.0 dev container are configured.
Dependencies are pinned with an npm lockfile. GitHub Actions CI runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not configured.

A Codespaces startup failure was observed when the Dockerfile ended with `USER node`: Codespaces entered recovery mode and reported permission failures while creating `/home/codespace`. The Dockerfile has therefore been changed to leave the image default user unchanged, while `devcontainer.json` continues to set `remoteUser` to `node`. A fresh Codespaces creation or rebuild is still required to validate this fix end-to-end.

---

## Physics model status

The guiding-center model is documented in `docs/PHYSICS.md`.

The current reduced model evolves the guiding-center radius `r` and the rotating-frame co-orbital angle `phi`.

The governing equations are derived from a fast-angle-averaged Hamiltonian with the free eccentricity action set to zero.

The reduced radial coordinate represents the guiding-center radius rather than the instantaneous physical radius of the full PCR3BP trajectory.

The model is intended primarily for:

- small secondary mass ratio;
- near-co-orbital motion;
- small free eccentricity;
- sufficiently weak close encounters with the secondary.

The model is currently considered provisional until it has been quantitatively compared with the full PCR3BP.

---

## Application specification status

Version 0.1 is defined in `docs/APP_SPEC.md`.

Implemented portions now include:

- numerical integration of the reduced guiding-center equations;
- rotating-frame static trajectory visualization;
- primary and secondary body markers;
- corotation circle;
- L4 and L5 markers;
- validated horseshoe/L4/L5 preset selection.

Still required for version 0.1:

- direct input of `mu`, `r0`, `phi0`, and duration;
- explicit Calculate action and numerical-error presentation;
- animation with play/pause/reset;
- `r(t)` visualization;
- angular evolution visualization;
- `phi` versus `r - 1` phase-space visualization;
- reduced-Hamiltonian and minimum-secondary-distance diagnostics;
- static deployment suitable for GitHub Pages.

Full PCR3BP comparison is intentionally deferred until the reduced model has been validated.

---

## Implementation status

Implemented:

- React entry point and responsive application layout;
- CSS and strict TypeScript checking;
- Vite configuration;
- Vitest DOM tests;
- `src/physics/guidingCenter.ts` with pure functions for body distances, the disturbing function, its analytic derivatives, guiding-center rates, the reduced Hamiltonian, and the local tidal-strength parameter;
- `src/physics/integrator.ts` with a transparent classical fourth-order Runge-Kutta stepper and fixed-step trajectory integration;
- `src/physics/presets.ts` with reproducible horseshoe, L4 tadpole, and L5 tadpole examples;
- `src/components/TrajectoryPlot.tsx` with static SVG trajectory rendering, equal axes, corotation circle, primary/secondary markers, and L4/L5 markers;
- preset selection in `App.tsx`, with trajectory recalculation from the public integrator interface;
- unit and regression tests for the physics core, integrator, preset orbit topology, trajectory rendering, and preset switching.

The trajectory SVG downsamples paths longer than 1200 displayed vertices for rendering only; the numerical solution itself is not modified.

Current source structure:

    src/
      physics/
        guidingCenter.ts
        integrator.ts
        presets.ts
      components/
        TrajectoryPlot.tsx
      App.tsx

    tests/

The physics calculations remain separate from UI components.

---

## Numerical method status

A transparent fixed-step classical fourth-order Runge-Kutta integrator is implemented.

The requested `dt` is used for full steps, and the final step is shortened when necessary so the trajectory ends exactly at `tMax`.

The integrator rejects invalid time-step settings, caps the maximum number of steps, propagates domain errors from the physics model, and rejects non-finite or non-positive-radius numerical states.

The current validated example presets use `dt = 0.05`. Adaptive integration may be considered later if fixed-step integration is insufficient near horseshoe turns.

---

## Representative orbit presets

All current presets use `mu = 0.001`.

- Horseshoe: `r0 = 1.02`, `phi0 = pi`, `dt = 0.05`, `tMax = 250`.
- L4 tadpole: `r0 = 1`, `phi0 = +80 deg`, `dt = 0.05`, `tMax = 160`.
- L5 tadpole: `r0 = 1`, `phi0 = -80 deg`, `dt = 0.05`, `tMax = 160`.

These values are reproducible demonstration cases for this reduced model, not universal physical initial conditions.

The horseshoe regression test requires the trajectory to cross both sides of corotation in radius, span more than 5 radians in co-orbital angle while remaining away from conjunction, keep the tidal-strength indicator below 0.02, and conserve the reduced Hamiltonian to an absolute error below `1e-9`.

The tadpole tests require bounded leading/trailing libration around the corresponding triangular region, radial excursions near `r = 1`, and reduced-Hamiltonian error below `1e-10` for both L4 and L5 examples. Reflection symmetry of the equations involves time reversal as well as `phi -> -phi`, so forward-time L4 and L5 samples are not required to match point by point.

---

## Visualization status

The first rotating-frame visualization is implemented as an SVG component.

The plot uses:

- `x = r cos(phi)`;
- `y = r sin(phi)`;
- equal horizontal and vertical scaling;
- fixed limits of approximately `[-1.35, 1.35]` in both axes;
- the primary at `(-mu, 0)`;
- the secondary at `(1 - mu, 0)`;
- the corotation circle `r = 1`;
- L4/L5 markers at the standard PCR3BP triangular coordinates.

The current visualization is static. The initial trajectory point is marked, but there is not yet a moving current-position marker or animation.

---

## Validation status

GitHub Actions CI is configured to repeat `npm ci`, `npm test`, and `npm run build` automatically on pull requests and pushes to `main`.

Physics-core validation includes analytic-derivative finite-difference checks, exact `mu = 0` limits, reflection symmetry, body-distance checks, and input-domain checks.

Integrator validation includes reproduction of the analytic `mu = 0` solution, exact landing on `tMax`, reduced-Hamiltonian conservation for a perturbed orbit, and rejection of invalid integration settings.

Representative-orbit validation covers horseshoe topology, bounded L4/L5 tadpole topology on the appropriate leading/trailing sides, reduced-Hamiltonian conservation, and a close-approach proxy through `epsilon_tide` for the horseshoe example.

UI tests check that the static trajectory plot, body markers, L4/L5 markers, preset controls, and preset switching render in the DOM. A fresh interactive browser visual inspection of this new trajectory view has not yet been completed because the existing Codespace entered recovery mode before the dev-container permission fix.

The next validation tasks are:

1. create or rebuild a Codespace from the fixed dev-container configuration and verify normal startup;
2. run `npm run dev` and inspect the trajectory view in an interactive browser, including a narrow viewport;
3. expose Hamiltonian and validity diagnostics in the application;
4. quantify guiding-center accuracy against the full PCR3BP in a later development stage.

---

## Deployment status

GitHub is the canonical project repository.

The intended deployment target is GitHub Pages.

GitHub Pages has not yet been configured.

The intended application architecture is a static browser application with all numerical calculations performed client-side.

---

## Known issues and open questions

The following issues remain open:

- verify the Codespaces permission fix with a fresh creation or container rebuild;
- choose the final user-facing time step or integration tolerance policy;
- determine how approximation-validity warnings should be presented;
- quantify the accuracy of the guiding-center approximation near horseshoe U-turns;
- define a low-free-eccentricity initialization procedure for future full-PCR3BP comparison;
- decide whether 1200 rendered trajectory vertices is the appropriate display cap for all use cases;
- decide whether the SVG implementation remains sufficient once multiple diagnostic plots are added.

No hard validity threshold for close encounters has been adopted yet. The preset `epsilon_tide` bounds are regression guards, not physical validity thresholds.

---

## Next recommended task

First verify the repaired dev-container configuration by rebuilding or creating a Codespace and running the current application in a real browser.

After that, add user-editable `mu`, `r0`, `phi0`, and `tMax` controls with an explicit Calculate action and clear numerical failure reporting. At the same time, expose the reduced-Hamiltonian error and minimum distance to the secondary for the calculated trajectory. Add animation only after this static calculation/diagnostic workflow is stable.

---

## Session handoff rule

Before ending any substantial development session, update this file with:

- what was completed;
- what remains incomplete;
- known bugs or concerns;
- numerical or physical validation results;
- the next recommended task.

Do not rely on Codex session history, ChatGPT conversation history, or an uncommitted Codespace state to preserve project context.

The GitHub repository is the persistent record of the project.
