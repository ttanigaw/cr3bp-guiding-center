# Project State

Last updated: 2026-09-14

## Current phase

Guiding-center physics core, fixed-step RK4 integration, representative co-orbital presets, static rotating-frame visualization, editable initial conditions, and basic trajectory diagnostics are implemented.

The application now computes trajectories in the browser from either validated presets or user-edited `mu`, `r0`, `phi0`, and `tMax`. Calculation occurs only when the user explicitly presses Calculate. Physics, integration, diagnostics, presets, and visualization remain separated by module boundaries.

The next application goal is animation and the time-series / phase-space views required by version 0.1.

---

## Repository status

The following project documents are maintained:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`

`README.md` includes local development and Codespaces instructions.

React + TypeScript + Vite, Vitest, and a Node.js 24.20.0 dev container are configured. Dependencies are pinned with an npm lockfile. GitHub Actions CI runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`. GitHub Pages deployment is not configured.

A Codespaces startup failure was previously observed when the Dockerfile ended with `USER node`. Removing that directive while keeping `remoteUser: node` in `devcontainer.json` fixed the issue. A fresh Codespace created from the repaired configuration started normally, and `npm run dev` served the application successfully in a real browser.

---

## Physics model status

The guiding-center model is documented in `docs/PHYSICS.md`.

The current reduced model evolves the guiding-center radius `r` and rotating-frame co-orbital angle `phi`. The equations are derived from a fast-angle-averaged Hamiltonian with the free eccentricity action set to zero.

The reduced radial coordinate represents the guiding-center radius rather than the instantaneous physical radius of the full PCR3BP trajectory.

The model is intended primarily for small secondary mass ratio, near-co-orbital motion, small free eccentricity, and sufficiently weak close encounters with the secondary. The model remains provisional until quantitatively compared with the full PCR3BP.

---

## Application specification status

Version 0.1 is defined in `docs/APP_SPEC.md`.

Implemented portions now include:

- direct input of `mu`, `r0`, `phi0` in degrees, and integration duration;
- explicit Calculate action;
- numerical integration of the reduced guiding-center equations;
- rotating-frame static trajectory visualization;
- primary and secondary body markers;
- corotation circle;
- L4 and L5 markers;
- validated horseshoe/L4/L5 preset loading;
- numerical failure reporting;
- reduced-Hamiltonian drift diagnostic;
- minimum-secondary-distance diagnostic.

Still required for version 0.1:

- animation with play/pause/reset;
- `r(t)` visualization;
- angular evolution visualization;
- `phi` versus `r - 1` phase-space visualization;
- current-state diagnostics during animation;
- static deployment suitable for GitHub Pages.

Full PCR3BP comparison is intentionally deferred until the reduced model has been validated further.

---

## Implementation status

Implemented:

- responsive React application layout;
- strict TypeScript checking and Vite configuration;
- Vitest unit, regression, and DOM tests;
- `src/physics/guidingCenter.ts` with body distances, disturbing function, analytic derivatives, guiding-center rates, reduced Hamiltonian, and tidal parameter;
- `src/physics/integrator.ts` with a transparent classical fourth-order Runge-Kutta stepper and fixed-step trajectory integration;
- `src/physics/diagnostics.ts` with reusable trajectory diagnostics for maximum absolute Hamiltonian drift and minimum secondary distance;
- `src/physics/presets.ts` with reproducible horseshoe, L4 tadpole, and L5 tadpole examples;
- `src/components/TrajectoryPlot.tsx` with static equal-axis SVG trajectory rendering;
- editable physical controls and explicit Calculate workflow in `App.tsx`;
- clear user-facing calculation errors while retaining the last successful trajectory.

Preset buttons load example values into the editable form; they do not silently recalculate. User edits are likewise applied only on Calculate.

The trajectory SVG downsamples paths longer than 1200 displayed vertices for rendering only; the numerical solution itself is not modified.

Current source structure:

    src/
      physics/
        guidingCenter.ts
        integrator.ts
        diagnostics.ts
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

The current UI uses fixed `dt = 0.05`; this numerical setting is displayed but is not yet user-editable. The final user-facing time-step/tolerance policy remains open.

---

## Representative orbit presets

All current presets use `mu = 0.001`.

- Horseshoe: `r0 = 1.02`, `phi0 = pi`, `dt = 0.05`, `tMax = 250`.
- L4 tadpole: `r0 = 1`, `phi0 = +80 deg`, `dt = 0.05`, `tMax = 160`.
- L5 tadpole: `r0 = 1`, `phi0 = -80 deg`, `dt = 0.05`, `tMax = 160`.

These values are reproducible demonstration cases for this reduced model, not universal physical initial conditions.

Regression tests require horseshoe topology, bounded L4/L5 tadpole topology, reduced-Hamiltonian conservation, and a close-approach proxy through `epsilon_tide` for the horseshoe example.

---

## Visualization status

The rotating-frame visualization is implemented as an SVG component using

- `x = r cos(phi)`;
- `y = r sin(phi)`;
- equal horizontal and vertical scaling;
- fixed limits of approximately `[-1.35, 1.35]` in both axes;
- primary at `(-mu, 0)`;
- secondary at `(1 - mu, 0)`;
- corotation circle `r = 1`;
- L4/L5 markers at the standard PCR3BP triangular coordinates.

The current visualization is static. The initial trajectory point is marked, but there is not yet a moving current-position marker or animation.

---

## Validation status

GitHub Actions CI automatically repeats `npm ci`, `npm test`, and `npm run build` on pull requests and pushes to `main`.

Physics-core validation includes analytic-derivative finite-difference checks, exact `mu = 0` limits, reflection symmetry, body-distance checks, and input-domain checks.

Integrator validation includes reproduction of the analytic `mu = 0` solution, exact landing on `tMax`, reduced-Hamiltonian conservation for a perturbed orbit, and rejection of invalid integration settings.

Representative-orbit validation covers horseshoe topology, bounded L4/L5 tadpole topology on the appropriate leading/trailing sides, reduced-Hamiltonian conservation, and a close-approach proxy through `epsilon_tide`.

A fresh Codespace created after the dev-container permission fix started normally. The application was then inspected in a real desktop browser. The horseshoe display rendered correctly, and the L4 and L5 tadpole presets were each selected and visually confirmed to behave normally.

DOM tests now also exercise the explicit Calculate workflow, diagnostics rendering, and invalid-input error reporting.

The next validation tasks are:

1. inspect the new editable-control and diagnostics UI in a real browser;
2. verify the responsive layout at a narrow viewport;
3. quantify guiding-center accuracy against the full PCR3BP in a later development stage.

---

## Deployment status

GitHub is the canonical project repository.

The intended deployment target is GitHub Pages. GitHub Pages has not yet been configured.

The application architecture remains a static browser application with all numerical calculations performed client-side.

---

## Known issues and open questions

The following issues remain open:

- choose the final user-facing time step or integration tolerance policy;
- determine how approximation-validity warnings should be presented;
- quantify the accuracy of the guiding-center approximation near horseshoe U-turns;
- define a low-free-eccentricity initialization procedure for future full-PCR3BP comparison;
- decide whether 1200 rendered trajectory vertices is the appropriate display cap for all use cases;
- decide whether the SVG implementation remains sufficient once multiple diagnostic plots are added.

No hard validity threshold for close encounters has been adopted yet. The preset `epsilon_tide` bounds are regression guards, not physical validity thresholds.

---

## Next recommended task

After checking the new controls and diagnostics in a real browser, add animation with a current-position marker and play/pause/reset controls without changing the numerical solution.

Then add `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots using the already calculated trajectory.

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
