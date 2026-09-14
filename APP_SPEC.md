# Application Specification

## 1. Purpose

This document defines the functional and user-interface requirements of the `cr3bp-guiding-center` web application.

The application is intended to visualize co-orbital motion in the planar circular restricted three-body problem (PCR3BP), with particular emphasis on the reduced guiding-center model defined in `docs/PHYSICS.md`.

The main educational and scientific goal is to make horseshoe and tadpole motion understandable without the visual complication of free epicyclic oscillation.

The application should run entirely in a web browser and should not require a server-side numerical backend.

---

## 2. Source of truth

The physical model is defined in:

`docs/PHYSICS.md`

This document defines only application behavior, visualization, controls, and implementation-level requirements.

If there is any conflict between this file and `docs/PHYSICS.md`, the physics document takes precedence.

---

## 3. Deployment model

The application should be implemented as a static browser application.

The intended deployment target is GitHub Pages.

The application should therefore:

- run entirely on the client side;
- perform numerical integration in the browser;
- require no user account;
- require no backend database;
- require no external numerical service;
- work from a normal web browser on desktop computers.

Support for tablets and mobile devices is desirable but is not required for the first release.

---

## 4. Initial implementation scope

The first working version should implement only the reduced guiding-center model.

The default state variables are:

`r`

and

`phi`

as defined in `docs/PHYSICS.md`.

The first release should allow a user to:

1. choose the mass ratio `mu`;
2. choose the initial guiding-center radius `r0`;
3. choose the initial rotating-frame angle `phi0`;
4. choose an integration duration;
5. calculate the orbit;
6. visualize the orbit in the rotating frame;
7. inspect the radial and angular evolution;
8. inspect basic numerical diagnostics.

The full PCR3BP comparison mode is planned for a later stage.

---

## 5. Default physical model

The default numerical model is the reduced guiding-center system defined in `docs/PHYSICS.md`.

The application must use the same:

- nondimensionalization;
- coordinate definitions;
- mass-ratio convention;
- sign conventions;
- disturbing function;
- analytic derivatives;
- interpretation of the reduced radial coordinate.

The application must not silently substitute a different approximation.

---

## 6. Main user controls

The main control panel should contain the following parameters.

### 6.1 Mass ratio

Parameter:

`mu`

The initial recommended default should be small enough to clearly show co-orbital dynamics while remaining within the intended approximation regime.

A suitable initial default is:

`mu = 0.001`

The UI should allow direct numerical entry.

A slider may also be provided later.

---

### 6.2 Initial guiding-center radius

Parameter:

`r0`

The default should be close to the corotation radius:

`r = 1`

A suitable initial value should be chosen to produce a clear horseshoe or tadpole trajectory.

The final default value should be selected after numerical experimentation.

---

### 6.3 Initial rotating-frame angle

Parameter:

`phi0`

The interface should allow angle entry in degrees for user convenience.

Internally, calculations should use radians.

The UI should display clearly whether an angle is given in degrees or radians.

---

### 6.4 Integration duration

Parameter:

`tMax`

Time is measured in the nondimensional units defined in `docs/PHYSICS.md`.

Because the binary orbital period is:

`2 pi`

the interface should also display the equivalent number of binary orbital periods where useful.

---

### 6.5 Numerical resolution

The first version may expose either:

- integration time step, or
- numerical tolerance,

depending on the integrator selected.

For ordinary users, advanced numerical controls should not dominate the main interface.

A separate "Numerical settings" section is preferred.

---

## 7. Main actions

The interface should provide at least the following actions:

- Calculate
- Play
- Pause
- Reset

A recalculation should occur when the user explicitly requests it.

The first version does not need to recalculate continuously while parameters are being edited.

---

## 8. Primary visualization: rotating-frame orbit

The main visualization should show the trajectory in the rotating Cartesian plane.

Coordinates are obtained from the reduced variables using:

`x = r cos(phi)`

`y = r sin(phi)`

The plot should show:

- the primary body;
- the secondary body;
- the trajectory of the third body;
- the current position of the third body during animation;
- the corotation circle `r = 1`.

The primary and secondary should remain fixed in the rotating frame.

The plot should use equal aspect ratio so that circles appear as circles.

The plot limits should remain sufficiently stable during animation to avoid distracting automatic rescaling.

---

## 9. Body positions

In the adopted nondimensional rotating frame:

- the primary is located at `(-mu, 0)`;
- the secondary is located at `(1 - mu, 0)`.

The secondary should be visually distinguishable from the primary.

The size of the displayed symbols does not need to correspond to the physical radii of the bodies.

---

## 10. Lagrange-point markers

The application should eventually display the Lagrange points.

For the initial release, the highest priority is to display:

- L4;
- L5.

Their positions in the standard PCR3BP coordinates are:

`x = 1/2 - mu`

`y = +sqrt(3)/2`

for L4, and

`x = 1/2 - mu`

`y = -sqrt(3)/2`

for L5.

L1, L2, and L3 may be added later.

---

## 11. Orbit animation

The trajectory should be animatable.

Animation speed is a visualization parameter and must not modify the numerical solution.

The UI should allow:

- play;
- pause;
- reset;
- adjustment of playback speed.

The displayed trajectory may show either:

- the full calculated path, with a moving marker; or
- the path accumulated up to the current animation time.

The preferred initial implementation is to show the full path in a subdued style and emphasize the current position.

---

## 12. Radial evolution view

The application should provide a plot of:

`r(t)`

This plot represents the guiding-center radius, not the instantaneous radial coordinate of a full PCR3BP orbit.

The plot should clearly indicate the corotation radius:

`r = 1`

This view is important for understanding the radial excursion of horseshoe motion.

---

## 13. Angular evolution view

The application should provide a plot of:

`phi(t)`

The application should distinguish between:

- wrapped angle, typically shown within a fixed angular interval;
- continuous unwrapped angle, if needed for diagnostics.

For co-orbital visualization, the wrapped rotating-frame angle is generally more intuitive.

The initial version should use a clearly documented convention, such as:

`-pi < phi <= pi`

or:

`0 <= phi < 2 pi`

The selected convention should be used consistently throughout the application.

---

## 14. Phase-space view

The application should provide a phase-space-style plot using:

`phi`

and

`r`

or preferably:

`phi`

and

`r - 1`

This plot should help distinguish:

- horseshoe trajectories;
- tadpole trajectories;
- circulation.

The horizontal angle axis may be displayed in degrees for readability.

---

## 15. Diagnostics panel

The application should calculate and display basic diagnostics.

At minimum:

- current `r`;
- current `phi`;
- minimum distance to the secondary;
- reduced Hamiltonian error.

The reduced Hamiltonian diagnostic should use the definition in `docs/PHYSICS.md`.

The application should distinguish between:

- numerical accuracy diagnostics;
- physical validity indicators.

A small Hamiltonian error does not imply that the guiding-center approximation is physically accurate.

---

## 16. Approximation-validity indicators

The application should eventually display quantities relevant to the validity of the reduced approximation.

Important quantities include:

`r2`

and:

`epsilon_tide = mu / r2^3`

The application should not initially impose a hard universal validity threshold.

Instead, it may display a warning when the trajectory approaches the secondary closely.

The wording should make clear that the warning concerns the validity of the approximation, not necessarily numerical failure.

---

## 17. Numerical integration

The numerical solver should be implemented separately from the UI.

For the first implementation, a standard explicit Runge-Kutta method is acceptable.

A fourth-order Runge-Kutta method is sufficient for an initial implementation if the time step is chosen conservatively.

An adaptive method may be introduced later if needed.

The implementation should favor:

- reproducibility;
- transparency;
- predictable numerical behavior;
- easy testing.

The numerical method should not contain hidden smoothing.

---

## 18. Numerical failure handling

The solver should stop or return a clear error state if:

- `r <= 0`;
- a non-finite value appears;
- the trajectory approaches a singular configuration beyond what the solver can safely handle.

The UI should display an understandable message rather than silently producing an invalid trajectory.

---

## 19. Default visualization layout

A suitable desktop layout is:

- control panel on the left;
- main rotating-frame orbit plot on the right;
- diagnostic and secondary plots below.

A possible layout is:

    -------------------------------------------------
    | Controls     | Rotating-frame orbit          |
    |              |                               |
    -------------------------------------------------
    | r(t)         | phi(t)                        |
    -------------------------------------------------
    | Phase space  | Diagnostics                   |
    -------------------------------------------------

This layout is only a recommendation.

Responsive behavior may rearrange panels on narrower screens.

---

## 20. Visual design

The visual design should prioritize clarity over decoration.

The interface should:

- use a clean light or dark theme;
- maintain good contrast;
- avoid unnecessary animation;
- use consistent symbols and labels;
- display mathematical variables using familiar notation where practical.

The visualization should make it immediately clear:

- where the two massive bodies are;
- where the third body is;
- whether the orbit is horseshoe-like or tadpole-like;
- how the guiding-center radius changes.

---

## 21. Units and labels

The application should state clearly that the variables are nondimensional.

Where useful, the UI should explain that:

- binary separation is `1`;
- binary angular frequency is `1`;
- binary orbital period is `2 pi`;
- corotation radius is near `r = 1`.

The user should not have to infer these conventions from the source code.

---

## 22. Preset examples

A later version should provide preset initial conditions.

Useful presets include:

- Horseshoe orbit
- L4 tadpole orbit
- L5 tadpole orbit
- Near-separatrix orbit
- Circulating orbit

Each preset should define:

- `mu`;
- `r0`;
- `phi0`;
- integration duration;
- numerical settings if necessary.

Preset values should be validated numerically before inclusion.

---

## 23. Full PCR3BP comparison mode

A later release should provide a comparison mode between:

1. the reduced guiding-center model;
2. the full PCR3BP.

The two trajectories should be visually distinguishable.

The purpose is to demonstrate that the full trajectory contains epicyclic motion while the reduced solution follows the slow guiding-center evolution.

The comparison mode must not be implemented until the initialization procedure for a low-free-eccentricity full PCR3BP orbit has been defined and documented.

That initialization procedure belongs in `docs/PHYSICS.md` or a dedicated technical document.

---

## 24. Future filtering comparison

A later version may also compare the reduced solution with a filtered full-PCR3BP trajectory.

Possible approaches include:

- orbital-period averaging;
- low-pass filtering;
- extraction of osculating semimajor axis;
- canonical averaging diagnostics.

No filtering algorithm should be introduced without documenting its interpretation.

---

## 25. URL state and reproducibility

A desirable later feature is to encode important model parameters in the URL.

For example:

- `mu`;
- `r0`;
- `phi0`;
- integration duration.

This would allow a user to share a specific trajectory by sharing a URL.

This is not required for the first release.

---

## 26. Data export

A later version may allow trajectory data to be exported.

Possible formats include:

- CSV;
- JSON.

The first release does not require data export.

---

## 27. Performance

The expected system size is small.

The application should not require aggressive optimization.

Numerical accuracy and clarity take priority over frame rate or raw integration speed.

Trajectory calculation and animation should remain responsive for typical educational examples.

---

## 28. Accessibility

Controls should have textual labels.

The application should not rely solely on color to distinguish physically different objects or trajectories.

Plots should include readable axis labels.

Keyboard accessibility is desirable but is not required for the first prototype.

---

## 29. Version 0.1 acceptance criteria

Version 0.1 is considered complete when the application can:

1. accept `mu`, `r0`, `phi0`, and integration duration;
2. numerically integrate the reduced guiding-center equations;
3. display the orbit in the rotating `x-y` plane;
4. display the primary and secondary;
5. display the corotation circle;
6. animate the calculated trajectory;
7. display `r(t)`;
8. display `phi(t)` or an equivalent angular diagnostic;
9. display the `phi` versus `r - 1` phase-space trajectory;
10. calculate the reduced Hamiltonian along the trajectory;
11. report numerical failure clearly;
12. run as a static web application suitable for GitHub Pages.

Full PCR3BP comparison is not required for version 0.1.

---

## 30. Version 0.2 target

A reasonable next milestone is:

- L4 and L5 markers;
- validated horseshoe and tadpole presets;
- approximation-validity diagnostics;
- improved numerical controls;
- improved responsive layout.

---

## 31. Version 0.3 target

A later milestone should add:

- full PCR3BP integration;
- low-free-eccentricity initialization;
- simultaneous full/reduced visualization;
- direct demonstration of epicyclic motion;
- quantitative comparison between the reduced and full systems.

---

## 32. Current development principle

The first goal is not to build a feature-rich application.

The first goal is to establish a physically correct, numerically reliable, and easily understandable implementation of the guiding-center model.

New features should be added only after the basic reduced dynamics have been validated.
