# Project State

Last updated: 2026-09-16

## Current phase

Version 0.1 of the reduced guiding-center visualizer is implemented on `main` and deployed publicly with GitHub Pages.

Live site:

https://ttanigaw.github.io/cr3bp-guiding-center/

The v0.1 baseline includes:

- reduced guiding-center physics and deterministic fixed-step RK4 integration;
- Horseshoe, L4 tadpole, and L5 tadpole presets;
- editable initial conditions and integration duration;
- synchronized rotating-frame and inertial-frame visualization;
- shared playback, current markers, afterimages, display-layer controls, and L4/L5 markers;
- fixed `r(t)`, wrapped `phi(t)`, and `phi` versus `r - 1` plots;
- phase-space `Magnify / 1:1 scale` and `Full width / Close-up with origin / Close-up` controls;
- synchronized current-state diagnostics;
- numerical-conservation monitoring using the reduced Hamiltonian `H_gc`;
- approximation-validity indicators including `r2`, `epsilon_tide`, and `|dot r / r|`;
- a selectable Custom X-Y diagnostic plot with independent X/Y variables and Linear / `log10` axis modes;
- GitHub Actions CI for tests/build and GitHub Pages deployment from `main`.

No full-PCR3BP integration is included in v0.1. The inertial panel remains a coordinate transformation of the reduced solution rather than a separate dynamical integration.

---

## Repository and documentation status

GitHub is the canonical project record. The repository is now public so GitHub Pages can be used on the current GitHub plan.

Maintained documents are:

- `AGENTS.md`
- `docs/PHYSICS.md`
- `docs/APP_SPEC.md`
- `docs/PLOT_SPEC.md`
- `docs/DIAGNOSTICS_SPEC.md`
- `docs/VISUAL_DESIGN.md`
- `docs/PROJECT_STATE.md`
- `README.md`

`docs/PHYSICS.md` remains authoritative for equations, signs, coordinates, nondimensionalization, approximation assumptions, and the reduced conserved quantity.

`README.md` was refreshed in PR #55 to match the implemented v0.1 application rather than the earlier development-stage roadmap.

---

## Physics and numerical baseline

The reduced state is `(r, phi)`, with rotating-frame polar coordinates

```text
x = r cos(phi)
y = r sin(phi)
```

and inertial azimuth

```text
theta = phi + t.
```

The reduced conserved quantity is

```text
H_gc = -1/(2r) - sqrt(r) - R(r, phi).
```

`Delta H_gc = H_gc(t) - H_gc(0)` is treated as a numerical-conservation diagnostic.

This is explicitly distinct from the Jacobi constant of the full PCR3BP. A future full-PCR3BP model should introduce its own `C_J` / `Delta C_J` diagnostics without relabeling the present reduced quantity.

The reduced approximation has no universal hard validity threshold in v0.1. `r2`, `epsilon_tide = mu/r2^3`, and `|dot r/r|` are shown as continuous indicators rather than collapsed into an unsupported binary valid/invalid judgment.

---

## Plotting baseline

### Fixed time-series plots

`r(t)` and wrapped `phi(t)` share one nondimensional time axis:

- left edge anchored at `t = 0`;
- equal 1-2-5-style nice tick spacing;
- displayed right edge rounded outward to the first tick containing the requested integration endpoint;
- identical time ticks in both panels.

`r(t)` uses `r = 1` as a true vertical tick/grid anchor with equal nice spacing around it.

Wrapped `phi(t)` uses

```text
-180 deg < phi <= 180 deg
```

and does not connect across wrap discontinuities.

### Reduced phase space

The `phi` versus `r - 1` panel provides:

- **Magnify** and **1:1 scale** vertical modes;
- **Full width**, **Close-up with origin**, and **Close-up** horizontal modes;
- wrap fallback to Full width when a contracted interval would cross `+180/-180 deg`;
- secondary marker at `(0, -mu)` when the origin lies in view;
- L4/L5 markers at `(+60 deg, 0)` and `(-60 deg, 0)` when the shared L4/L5 switch is on and each point lies in the displayed range;
- zero-anchored vertical ticks in ordinary Magnify views;
- endpoint-only vertical labels for very shallow 1:1 views where ordinary labels would overlap.

### Custom X-Y plot

Selectable variables are:

- `t`;
- `r`;
- `r - 1`;
- wrapped `phi`;
- `r2`;
- `epsilon_tide`;
- `H_gc`;
- `Delta H_gc`;
- `|Delta H_gc|`;
- `dot r`;
- `dot phi`;
- `|dot r / r|`.

Default axes are `X = t`, `Y = Delta H_gc`.

Linear Custom X-Y axes follow one common auto-fit rule:

- actual plotted min/max plus any reference value define the required span;
- resolved finite-width data are displayed at their real scale with small padding;
- a variable-specific `fallbackSpan` is used only for effectively degenerate data;
- if zero lies in range, zero is a labeled tick anchor with equal 1-2-5-style spacing;
- tiny resolved values are preserved because tick cleanup is relative to the selected tick interval rather than a fixed absolute cutoff.

Each axis independently supports `log10` only when every stored plotted value is finite and strictly positive. No samples are silently discarded to enable logarithmic plotting.

---

## Validation status

GitHub Actions CI runs `npm ci`, `npm test`, and `npm run build` for pull requests and pushes to `main`.

The recent v0.1 stabilization sequence includes:

- PR #45: phase-space vertical-range/tick refinement;
- PR #47: phase-space and Custom X-Y control-layout refinement;
- PR #49: `r(t)` vertical axis anchored to `r = 1`;
- PR #51: shared nice time axis for `r(t)` and `phi(t)`;
- PR #53: common Custom X-Y linear auto-fit and tiny-value preservation;
- PR #55: README refresh for the implemented v0.1 feature set;
- PR #56: GitHub Pages workflow and Pages-specific Vite base path.

Regression tests cover, among other items:

- reduced-model conservation and `mu = 0` behavior;
- rotating/inertial coordinate transformations;
- wrapped-angle discontinuity handling;
- shared playback-marker synchronization;
- phase-space Close-up and 1:1 display behavior;
- zero-anchored nice ticks;
- fixed `r(t)` / `phi(t)` time-axis agreement;
- Custom X-Y selector behavior;
- Linear / `log10` eligibility and transformation;
- tiny resolved `Delta H_gc` ranges versus effectively constant nonzero-baseline quantities.

The PR #56 code-bearing CI passed before merge, and the ordinary `main` CI also passed after merge.

---

## GitHub Pages deployment

PR #56 added `.github/workflows/pages.yml` and Pages-aware Vite configuration.

Deployment behavior is:

- local/Codespaces development uses the normal `/` base path;
- Pages builds use `/cr3bp-guiding-center/`;
- pushes to `main` automatically build and deploy `dist/`;
- the workflow can also be started manually with `workflow_dispatch`.

The first Pages run failed at `actions/configure-pages` because Pages had not yet been enabled for the repository. After the repository was made public and **Settings -> Pages -> Source: GitHub Actions** was enabled, the failed workflow was re-run.

The re-run completed successfully:

- build: success;
- Configure GitHub Pages: success;
- upload Pages artifact: success;
- deploy: success.

The deployment job reported the environment URL:

https://ttanigaw.github.io/cr3bp-guiding-center/

This establishes the public v0.1 deployment baseline.

---

## Version 0.1 status

The planned v0.1 implementation, documentation refresh, CI validation, and static deployment are complete.

Further v0.1 work should be limited to bug fixes or browser-specific presentation issues discovered while using the public site. New model scope should not be mixed into v0.1 stabilization unless required to correct a physical or numerical error.

---

## Next recommended task

Use the deployed GitHub Pages application as the baseline and do one short public-site smoke test of:

- Horseshoe preset;
- L4 tadpole preset;
- L5 tadpole preset;
- Play / Pause / Reset;
- phase-space Full width and both Close-up modes;
- Magnify and 1:1 scale;
- Custom `t` versus `Delta H_gc`;
- one positive variable in `log10` mode.

If no deployment-specific issue is found, tag or otherwise record the current state as the v0.1 baseline before beginning the next major phase.

The main deferred development direction is full-PCR3BP integration and direct comparison against the reduced guiding-center model. That work should begin as a separate phase with its own design update to `APP_SPEC.md`, `PHYSICS.md`, and `PROJECT_STATE.md` before implementation.

---

## Session handoff rule

Before ending substantial work, update this file with completed work, incomplete work, concerns, validation results, and the next recommended task. Do not rely on chat history or uncommitted workspace state for project continuity.
