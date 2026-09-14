# Project State

Last updated: 2026-09-14

## Current phase

Initial web application development scaffold completed.

A minimal React page is implemented; physics, integration, and visualization have not started.

The development scaffold supports continuing work from a fresh checkout or Codespace.
The next implementation goal is the independent physics module and its tests.

---

## Repository status

The following project documents have been prepared:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PROJECT_STATE.md`

`README.md` is present and includes local development and Codespaces instructions.

React + TypeScript + Vite, Vitest, and a Node.js 24.20.0 dev container are configured.
Dependencies are pinned with an npm lockfile. GitHub Pages deployment is not configured.

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

Implemented: minimal React entry point and placeholder page, CSS, strict TypeScript
checking, Vite configuration, and a Vitest DOM mounting smoke test.

`src/physics/` and `src/components/` contain only directory placeholders. No equations,
integrator, plotting library, or visualization have been added.

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

Before accepting the implementation, it should be tested using:

- `mu = 0`;
- conservation of the reduced Hamiltonian;
- simple near-corotation trajectories;
- symmetry checks where appropriate.

Adaptive integration may be considered later if fixed-step integration is insufficient near horseshoe turns.

---

## Validation status

Browser check passed in Chromium: the placeholder page renders, with no runtime
errors or horizontal overflow at a 375px viewport. Vite was restarted after the
clean dependency install to refresh its dependency cache.

Scaffold checks passed: `npm ci`, `npm test` (one DOM smoke test), and
`npm run build` (TypeScript check and production bundle). The dev-container image
built successfully; its base image is pinned by version and digest. A fresh GitHub
Codespaces creation has not been exercised in this session.

No numerical validation has been performed yet; no numerical code exists, so
trajectory and numerical-instability checks are not applicable to this scaffold.

The first validation tasks should include:

1. verifying the analytic derivatives of the disturbing function against numerical finite differences;
2. checking the `mu = 0` limit;
3. checking reduced-Hamiltonian conservation;
4. finding stable example initial conditions for horseshoe motion;
5. finding stable example initial conditions for L4 and L5 tadpole motion;
6. examining the approximation-validity indicators near horseshoe turns.

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

Implement the guiding-center physics module independently of the UI, using the
analytic expressions in `docs/PHYSICS.md`, with derivative and limiting-case tests.

Then implement the numerical integrator, verify reduced-Hamiltonian conservation,
and only then begin trajectory visualization.

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
