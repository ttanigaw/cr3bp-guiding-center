# AGENTS.md

## Project overview

This repository contains a browser-based visualization tool for the planar circular restricted three-body problem (PCR3BP), with particular emphasis on a reduced guiding-center model that suppresses free epicyclic motion while retaining slow co-orbital dynamics such as horseshoe and tadpole motion.

The GitHub repository is the canonical source of truth for this project.

Do not rely on prior chat history, Codex session history, or local workspace state as the authoritative project record.

---

## Required reading before making changes

Before modifying code or documentation, read the following files:

1. `docs/PHYSICS.md`
2. `docs/APP_SPEC.md`
3. `docs/PROJECT_STATE.md`

Also read `README.md` when the task concerns user-facing behavior, setup, or deployment.

These files define the current physical model, application requirements, and project status.

---

## Physics rules

`docs/PHYSICS.md` is the authoritative source for the physical model.

Do not modify the governing equations, sign conventions, coordinate definitions, nondimensionalization, approximation assumptions, or interpretation of variables without explicitly updating `docs/PHYSICS.md`.

In particular, do not silently replace the guiding-center equations with a different approximation.

The current reduced model is based on the guiding-center variables described in `docs/PHYSICS.md`.

When implementing the model:

- use the analytic expressions given in `docs/PHYSICS.md`;
- preserve the stated sign conventions;
- distinguish clearly between the full PCR3BP instantaneous coordinates and the reduced guiding-center variables;
- do not assume that the reduced radial variable is the instantaneous physical radius of the full PCR3BP trajectory;
- preserve the stated validity limitations near close encounters with the secondary.

If implementation behavior appears inconsistent with `docs/PHYSICS.md`, treat this as a problem to investigate rather than changing the physics model automatically.

---

## Numerical implementation

Prefer numerically transparent methods and implementations that can be inspected easily.

For the first implementation:

- prioritize correctness over optimization;
- keep the physics calculation separate from visualization code;
- use deterministic integration for identical inputs;
- expose numerical parameters explicitly where useful;
- monitor relevant conserved quantities and validity indicators defined in `docs/PHYSICS.md`;
- avoid hidden smoothing or filtering unless explicitly documented.

When adding a numerical integrator, include tests against simple limiting cases where possible.

Examples include:

- `mu = 0`;
- nearly circular unperturbed motion;
- conservation of the reduced Hamiltonian;
- symmetry checks where appropriate.

Do not introduce numerical regularization near singular encounters without documenting the method and its physical meaning.

---

## Code organization

Keep physical calculations separated from UI code.

A preferred structure is:

    src/
      physics/
        guidingCenter.ts
        cr3bp.ts
        integrator.ts
      components/
      App.tsx

    docs/
      PHYSICS.md
      APP_SPEC.md
      PROJECT_STATE.md

    tests/

Equivalent organization is acceptable if there is a clear reason.

Physics functions should be usable independently of the UI.

Avoid embedding governing equations directly inside rendering components.

---

## UI and visualization

The application is intended to make the dynamics understandable, not merely to display a trajectory.

Visualization should therefore favor physical interpretation.

Where appropriate, show:

- the primary and secondary;
- the corotation radius;
- the trajectory in the rotating frame;
- the guiding-center radius;
- the slow co-orbital angle;
- relevant diagnostics;
- comparison with the full PCR3BP when implemented.

Do not add decorative complexity that obscures the physical interpretation.

---

## Documentation rules

Any significant implementation change should be reflected in the relevant documentation.

Update:

- `docs/PHYSICS.md` for changes to the physical model;
- `docs/APP_SPEC.md` for changes to application behavior or UI requirements;
- `docs/PROJECT_STATE.md` for current implementation status and next steps;
- `README.md` for user-facing setup, usage, or deployment changes.

Do not leave important design decisions only in commit messages, issue comments, or chat history.

---

## Project state

Before starting substantial work, read `docs/PROJECT_STATE.md`.

Before ending substantial work, update `docs/PROJECT_STATE.md` with:

- what was implemented;
- what remains incomplete;
- known issues;
- numerical or physical concerns;
- the next recommended task.

Keep this file concise and operational.

---

## Testing

Before committing substantial changes:

1. run the available tests;
2. run the application;
3. verify that the relevant visualization works;
4. check for obvious numerical instability;
5. verify that documentation remains consistent with the implementation.

If a test is skipped or cannot be run, record that in `docs/PROJECT_STATE.md`.

---

## Git workflow

The GitHub repository is the persistent project record.

Workspaces, Codespaces, local files, and Codex sessions should be treated as replaceable.

Before ending a work session:

1. ensure intended changes are saved;
2. update `docs/PROJECT_STATE.md`;
3. commit the changes;
4. push them to GitHub.

Do not depend on uncommitted workspace state for project continuity.

Use clear commit messages describing the actual change.

---

## Scope control

When asked to implement a specific task, avoid unrelated refactoring.

Do not change the physical model, framework, numerical method, file structure, or deployment strategy unless the task requires it or the change is clearly justified.

If a requested change conflicts with `docs/PHYSICS.md` or `docs/APP_SPEC.md`, identify the conflict explicitly before proceeding.

---

## Default priorities

When tradeoffs arise, use this order of priority:

1. physical correctness;
2. numerical correctness;
3. clarity and reproducibility;
4. maintainability;
5. visualization quality;
6. performance optimization.

For this project, a transparent and physically interpretable implementation is preferred over a clever but opaque one.
