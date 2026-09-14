# Project State

Last updated: 2026-09-14

## Current phase

Guiding-center physics core implemented and under validation.

A minimal React page is implemented. The reduced guiding-center equations, disturbing function, analytic derivatives, reduced Hamiltonian, body-distance diagnostics, and tidal parameter are now implemented independently of the UI.

The next implementation goal is the numerical integrator and reduced-Hamiltonian conservation testing.

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

The first implementation will include:

- input of `mu`;
- input of initial `r`;
- input of initial `phi`;
- integration duration;
- numerical integration of the reduced guiding-center equations;
- rotating-frame trajectory visualization;
- animation;
- `r(t)` visualization;
- angular evolution visualization;
- `phi` versus `r - 1` phase-space visualization;
- reduced-Hamiltonian diagnostic;
- clear numerical failure reporting;
- static deployment suitable for GitHub Pages.

Full PCR3BP comparison is intentionally deferred until the reduced model has been validated.

---

## Implementation status

Implemented:

- minimal React entry point and placeholder page;
- CSS and strict TypeScript checking;
- Vite configuration;
- Vitest DOM mounting smoke test;
- `src/physics/guidingCenter.ts` with pure functions for body distances, the disturbing function, its analytic derivatives, guiding-center rates, the reduced Hamiltonian, and the local tidal-strength parameter;
- unit tests for analytic derivatives, the `mu = 0` limit, reflection symmetry in `phi`, body distances, and input-domain checks.

The physics functions are independent of React and visualization code.

Planned source structure:

    src/
      physics/
        guidingCenter.ts
        integrator.ts
      components/
      App.tsx

    tests/

The exact structure may change if there is a clear implementation reason, but physics calculations should remain separate from UI components.

---

## Numerical method status

No numerical integrator has been implemented yet.

The initial candidate is a transparent explicit fourth-order Runge-Kutta method.

Before accepting the integrator, it should be tested using:

- `mu = 0`;
- conservation of the reduced Hamiltonian;
- simple near-corotation trajectories;
- symmetry checks where appropriate.

Adaptive integration may be considered later if fixed-step integration is insufficient near horseshoe turns.

---

## Validation status

Browser check passed in Chromium for the placeholder application, with no runtime errors or horizontal overflow at a 375px viewport.

Scaffold checks previously passed: `npm ci`, `npm test`, and `npm run build`; the dev-container image also built successfully. GitHub Actions CI is configured to repeat the install, test, and build checks automatically on pull requests and pushes to `main`.

Physics-core validation currently includes:

1. analytic disturbing-function derivatives checked against centered numerical finite differences at a representative non-singular state;
2. exact `mu = 0` limiting behavior for the disturbing function, derivatives, radial rate, angular rate, reduced Hamiltonian, and tidal parameter;
3. expected reflection symmetry under `phi -> -phi`;
4. barycentric body-distance checks;
5. rejection of non-positive `r`, out-of-range `mu`, and non-finite inputs.

Reduced-Hamiltonian conservation along trajectories has not yet been tested because the numerical integrator is not implemented.

The next validation tasks are:

1. implement a transparent numerical integrator;
2. check reduced-Hamiltonian conservation;
3. test simple near-corotation trajectories;
4. find stable example initial conditions for horseshoe motion;
5. find stable example initial conditions for L4 and L5 tadpole motion;
6. examine approximation-validity indicators near horseshoe turns.

Quantitative comparison with the full PCR3BP will be performed in a later development stage.

---

## Deployment status

GitHub is the canonical project repository.

The intended deployment target is GitHub Pages.

GitHub Pages has not yet been configured.

The intended application architecture is a static browser application with all numerical calculations performed client-side.

---

## Known issues and open questions

The following issues remain open:

- determine suitable default initial conditions for a clear horseshoe trajectory;
- determine suitable default initial conditions for L4 and L5 tadpole trajectories;
- choose the final numerical time step or integration tolerance;
- determine how approximation-validity warnings should be presented;
- quantify the accuracy of the guiding-center approximation near horseshoe U-turns;
- define a low-free-eccentricity initialization procedure for future full-PCR3BP comparison;
- decide which plotting library or rendering approach should be used.

No hard validity threshold for close encounters has been adopted yet.

---

## Next recommended task

Implement the numerical integrator independently of the UI, initially using a transparent fixed-step fourth-order Runge-Kutta method.

Then verify reduced-Hamiltonian conservation and simple limiting cases before beginning trajectory visualization.

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
