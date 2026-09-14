# CR3BP Guiding-Center Visualizer

A browser-based visualization tool for co-orbital motion in the planar circular restricted three-body problem (PCR3BP).

The main focus of this project is a reduced guiding-center model that suppresses free epicyclic motion while retaining the slow co-orbital dynamics responsible for horseshoe and tadpole trajectories.

The application is intended for educational and scientific visualization.

---

## Project goals

The project aims to provide an intuitive visualization of co-orbital dynamics in a rotating frame.

In particular, it is designed to show:

- horseshoe motion;
- tadpole motion around L4 and L5;
- guiding-center radial migration;
- angular-momentum exchange with the secondary;
- the difference between reduced guiding-center motion and the full PCR3BP.

A future comparison mode will show how free epicyclic motion appears in the full equations but is removed from the reduced guiding-center model.

---

## Physical model

The default model is a reduced guiding-center approximation to the planar circular restricted three-body problem.

The reduced variables are:

- guiding-center radius `r`;
- rotating-frame co-orbital angle `phi`.

The model removes the independent free-eccentricity degree of freedom through fast-angle averaging.

The governing equations, assumptions, coordinate definitions, and validity conditions are documented in:

`docs/PHYSICS.md`

That file is the authoritative source for the physical model.

---

## Application specification

The planned application behavior and user-interface requirements are documented in:

`docs/APP_SPEC.md`

The first release will focus on the reduced guiding-center model only.

Planned version 0.1 features include:

- user input for mass ratio `mu`;
- initial guiding-center radius;
- initial rotating-frame angle;
- integration duration;
- numerical integration in the browser;
- rotating-frame orbit visualization;
- orbit animation;
- `r(t)` plot;
- angular evolution plot;
- `phi` versus `r - 1` phase-space plot;
- reduced-Hamiltonian diagnostic;
- basic approximation-validity diagnostics.

---

## Project status

Current development status is documented in:

`docs/PROJECT_STATE.md`

This file is updated during development and should be read before starting substantial work.

---

## Repository structure

The intended structure is approximately:

    AGENTS.md
    README.md

    docs/
      PHYSICS.md
      APP_SPEC.md
      PROJECT_STATE.md

    src/
      physics/
        guidingCenter.ts
        cr3bp.ts
        integrator.ts
      components/
      App.tsx

    tests/

The exact source layout may evolve during implementation.

---

## Development principles

The project follows several priorities:

1. physical correctness;
2. numerical correctness;
3. clarity and reproducibility;
4. maintainability;
5. visualization quality;
6. performance optimization.

Physics calculations should remain separate from user-interface code.

The implementation should favor transparent numerical methods over opaque optimization.

---

## Local development

The initial React + TypeScript + Vite scaffold is implemented. It displays a
placeholder page; physics, integration, and trajectory plots are not implemented.

Use Node.js 24.20.0 (also recorded in `.nvmrc`) and npm:

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. The development server binds to all interfaces to
support container port forwarding.

```sh
npm test            # run the Vitest smoke test once
npm run test:watch  # watch tests during development
npm run build      # TypeScript check and production bundle in dist/
npm run preview    # serve the production bundle locally
```

Dependencies use exact versions and a committed `package-lock.json`; use `npm ci`
for repeatable installs. Future physics modules belong in `src/physics/`, reusable
UI components in `src/components/`, and tests in `tests/`.

## GitHub Codespaces

Create a Codespace on the development branch, or reopen the repository in a dev
container. `.devcontainer/` selects Node.js 24.20.0 on Debian Bookworm and runs
`npm ci` after creation. Run `npm run dev`, then open forwarded port 5173 from the
Ports panel. The server does not start automatically.

This configures development only; GitHub Pages deployment is still pending.

---

## Development workflow

GitHub is the canonical source of truth for the project.

Codespaces, local workspaces, Codex sessions, and ChatGPT conversations should be treated as replaceable working environments rather than persistent project records.

Before making substantial changes, contributors and coding agents should read:

- `AGENTS.md`;
- `docs/PHYSICS.md`;
- `docs/APP_SPEC.md`;
- `docs/PROJECT_STATE.md`.

Important project decisions should be recorded in the repository rather than left only in chat or session history.

---

## Web deployment

The intended deployment target is GitHub Pages.

The application will be implemented as a static client-side web application.

Numerical integration will be performed directly in the user's browser.

No server-side numerical backend is planned for the initial versions.

---

## Current development stage

The project is currently in the specification and initial implementation stage.

The reduced physical model and application requirements have been documented.

The next major tasks are:

1. implement the guiding-center physics functions and unit tests;
2. implement and test the numerical integrator;
3. validate conservation of the reduced Hamiltonian;
4. find representative horseshoe and tadpole initial conditions;
5. implement the first trajectory visualizations;
6. configure GitHub Pages deployment.

---

## Planned future features

Possible later additions include:

- full PCR3BP integration;
- direct full-versus-reduced comparison;
- visualization of epicyclic motion;
- filtered or orbit-averaged full trajectories;
- L1, L2, and L3 markers;
- preset orbit examples;
- shareable parameterized URLs;
- CSV or JSON trajectory export;
- improved approximation-validity diagnostics.

---

## Documentation

The main project documents are:

- `AGENTS.md`  
  Development rules for human and AI contributors.

- `docs/PHYSICS.md`  
  Physical model, derivation, assumptions, and validity conditions.

- `docs/APP_SPEC.md`  
  Application behavior and visualization requirements.

- `docs/PROJECT_STATE.md`  
  Current implementation status, open issues, and next tasks.

---

## License

License not yet selected.
