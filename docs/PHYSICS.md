# Physics Model

## 1. Purpose

This document defines the physical model used in the `cr3bp-guiding-center` web application.

The primary purpose of the application is to visualize co-orbital motion in the planar circular restricted three-body problem (PCR3BP), especially horseshoe and tadpole trajectories, while approximately removing the free epicyclic motion that appears in the full equations of motion.

The reduced model should retain the slow evolution of the guiding center caused by gravitational torque from the secondary body, while suppressing the independent eccentricity degree of freedom.

The equations and approximations defined here are the reference model for the implementation. Any modification of the governing equations should be reflected in this document.

---

## 2. Physical setup

We consider the planar circular restricted three-body problem.

There are two massive bodies,

```math
m_1,\qquad m_2,
```

which move on circular orbits about their common center of mass.

A third body has negligible mass and therefore does not affect the motion of $m_1$ and $m_2$.

Define

```math
M=m_1+m_2,
```

and the dimensionless mass ratio

```math
\mu=\frac{m_2}{m_1+m_2}.
```

Thus,

```math
m_1=(1-\mu)M,
\qquad
m_2=\mu M.
```

Usually,

```math
0<\mu\le\frac12,
```

and the intended regime of the guiding-center approximation is primarily

```math
\mu\ll1.
```

---

## 3. Nondimensionalization

We adopt the standard nondimensional units of the circular restricted three-body problem:

```math
a=1,
\qquad
G(m_1+m_2)=1,
\qquad
n=1,
```

where $a$ is the separation between the two massive bodies and $n$ is their orbital angular frequency.

The orbital period of the binary is therefore

```math
T=2\pi.
```

All lengths, times, angular frequencies, and gravitational potentials used in the application are expressed in these units.

---

## 4. Rotating coordinate system

We use a Cartesian coordinate system rotating with angular velocity

```math
\boldsymbol{\Omega}=\mathbf e_z.
```

The origin is the center of mass of the two massive bodies.

The primary and secondary remain fixed at

```math
\mathbf r_1=(-\mu,0),
\qquad
\mathbf r_2=(1-\mu,0).
```

The position of the massless third body is

```math
(x,y).
```

We also introduce rotating-frame polar coordinates

```math
x=r\cos\phi,
\qquad
y=r\sin\phi.
```

Here $\phi$ is measured in the rotating frame.

If $\theta$ is the inertial azimuth,

```math
\theta=\phi+t,
```

so that

```math
\dot\theta=1+\dot\phi.
```

---

## 5. Distances from the massive bodies

The distance to $m_1$ is

```math
r_1=
\sqrt{(x+\mu)^2+y^2},
```

or equivalently,

```math
r_1^2
=
r^2+\mu^2+2\mu r\cos\phi.
```

The distance to $m_2$ is

```math
r_2=
\sqrt{(x-1+\mu)^2+y^2},
```

or equivalently,

```math
r_2^2
=
r^2+(1-\mu)^2
-2(1-\mu)r\cos\phi.
```

---

## 6. Full PCR3BP equations

The effective potential in the rotating frame is

```math
\Omega(x,y)
=
\frac12(x^2+y^2)
+
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2}.
```

The exact planar equations of motion are

```math
\ddot x-2\dot y
=
\frac{\partial\Omega}{\partial x},
```

```math
\ddot y+2\dot x
=
\frac{\partial\Omega}{\partial y}.
```

Explicitly,

```math
\ddot x-2\dot y
=
x
-
(1-\mu)\frac{x+\mu}{r_1^3}
-
\mu\frac{x-1+\mu}{r_2^3},
```

```math
\ddot y+2\dot x
=
y
-
(1-\mu)\frac{y}{r_1^3}
-
\mu\frac{y}{r_2^3}.
```

These equations retain all planar degrees of freedom of the PCR3BP, including eccentric or epicyclic motion.

---

## 7. Exact equations in rotating polar coordinates

In rotating-frame polar coordinates,

```math
x=r\cos\phi,
\qquad
y=r\sin\phi,
```

the exact equations are

```math
\ddot r-r\dot\phi^2-2r\dot\phi
=
\frac{\partial\Omega}{\partial r},
```

```math
r\ddot\phi
+
2\dot r\dot\phi
+
2\dot r
=
\frac1r
\frac{\partial\Omega}{\partial\phi}.
```

Equivalently, defining the gravitational part

```math
U(r,\phi)
=
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2},
```

the azimuthal equation can be written as an exact angular-momentum equation.

The inertial-frame specific angular momentum is

```math
j
=
r^2(1+\dot\phi).
```

It satisfies

```math
\boxed{
\dot j
=
\frac{\partial U}{\partial\phi}
}.
```

This relation is exact.

---

## 8. Separation into a Keplerian reference potential and a perturbation

We write

```math
U(r,\phi)
=
\frac1r+\mathcal R(r,\phi),
```

where

```math
\boxed{
\mathcal R(r,\phi)
=
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2}
-
\frac1r
}.
```

This decomposition is algebraically exact for any $\mu$.

However, treating $\mathcal R$ as a perturbation to the Keplerian potential is intended mainly for

```math
\mu\ll1
```

and away from very close encounters with the secondary.

In the limit

```math
\mu\rightarrow0,
```

we have

```math
\mathcal R\rightarrow0.
```

---

## 9. Physical meaning of the guiding-center approximation

The full PCR3BP has two planar degrees of freedom and therefore contains both

1. slow co-orbital motion, such as horseshoe or tadpole libration, and
2. a fast epicyclic degree of freedom associated with orbital eccentricity.

A full trajectory may schematically be written as

```math
r_{\rm physical}(t)
=
r_{\rm gc}(t)
+
\delta r_{\rm epi}(t),
```

where the fast component has approximately the form

```math
\delta r_{\rm epi}
\sim
e\cos(\kappa t+\psi).
```

The purpose of the reduced model is to eliminate the independent free-epicyclic degree of freedom while retaining the slow evolution of the guiding center caused by the gravitational perturbation of the secondary.

The reduced radial coordinate is therefore not, in general, the instantaneous physical radius of the full PCR3BP trajectory.

Instead, it represents a guiding-center radius,

```math
r_{\rm gc}\equiv a,
```

where $a$ is the semimajor axis of the corresponding locally circular Kepler orbit.

For notational simplicity, the reduced equations below continue to denote this guiding-center radius by $r$.

Thus, from Section 11 onward,

```math
r \equiv r_{\rm gc},
```

unless explicitly stated otherwise.

---

## 10. Poincaré variables and the epicyclic degree of freedom

To make the approximation precise, introduce planar Poincaré variables for the Kepler problem.

Let

```math
\Lambda=\sqrt a,
```

and

```math
\Gamma
=
\Lambda
\left(
1-\sqrt{1-e^2}
\right).
```

For small eccentricity,

```math
\Gamma
\simeq
\frac12\Lambda e^2.
```

The corresponding angles are

```math
\lambda=M+\varpi,
```

and

```math
\gamma=-\varpi,
```

where $M$ is the mean anomaly and $\varpi$ is the longitude of periapsis.

The inertial specific angular momentum is

```math
j
=
\Lambda-\Gamma
=
\Lambda\sqrt{1-e^2}.
```

For a circular orbit,

```math
e=0,
\qquad
\Gamma=0,
```

and therefore

```math
j=\Lambda=\sqrt a.
```

The eccentricity action $\Gamma$ is the action associated with the epicyclic degree of freedom.

Removing the free epicycle therefore corresponds, in the averaged system described below, to setting

```math
\Gamma=0.
```

---

## 11. Transformation to the rotating frame

Let the secondary have orbital longitude

```math
\lambda_2=t,
```

because the nondimensional binary angular frequency is unity.

Define the rotating-frame angles

```math
\phi=\lambda-t,
```

and

```math
\psi=\gamma+t=t-\varpi.
```

The canonical one-form transforms as

```math
\Lambda\,d\lambda+\Gamma\,d\gamma
=
\Lambda\,d\phi
+
\Gamma\,d\psi
+
(\Lambda-\Gamma)\,dt.
```

Therefore the rotating-frame Hamiltonian is obtained by subtracting the inertial angular momentum

```math
j=\Lambda-\Gamma.
```

Writing the gravitational potential as

```math
U=\frac1r+\mathcal R,
```

the rotating-frame Hamiltonian in Poincaré variables has the form

```math
K
=
-\frac{1}{2\Lambda^2}
-\Lambda
+\Gamma
-
\mathcal R(\Lambda,\Gamma,\phi,\psi).
```

In the unperturbed Kepler problem, $\mathcal R=0$, so

```math
\dot\phi
=
\Lambda^{-3}-1,
```

while

```math
\dot\psi=1.
```

Near the 1:1 resonance,

```math
\Lambda\simeq1,
```

and hence

```math
|\dot\phi|\ll1,
```

whereas $\psi$ continues to circulate with frequency of order unity.

Thus $\psi$ is the fast epicyclic angle, while $\phi$ is the slow co-orbital angle.

This separation of timescales is the basis of the guiding-center approximation.

---

## 12. Averaging over the epicyclic phase

We average the Hamiltonian over the fast angle $\psi$ while retaining the slow resonant angle $\phi$:

```math
\overline{\mathcal R}
(\Lambda,\Gamma,\phi)
=
\frac{1}{2\pi}
\int_0^{2\pi}
\mathcal R(\Lambda,\Gamma,\phi,\psi)\,d\psi.
```

The first-order averaged Hamiltonian is then

```math
\overline K
=
-\frac{1}{2\Lambda^2}
-\Lambda
+\Gamma
-
\overline{\mathcal R}
(\Lambda,\Gamma,\phi).
```

Because $\overline K$ is independent of $\psi$,

```math
\dot\Gamma
=
-\frac{\partial\overline K}{\partial\psi}
=
0.
```

Thus the epicyclic action is conserved in the averaged problem.

The zero-free-eccentricity model is obtained by choosing

```math
\Gamma=0.
```

This is the precise sense in which the reduced model removes the free epicycle.

For $\Gamma=0$, the orbit is circular and

```math
a=\Lambda^2.
```

The perturbing potential becomes independent of $\psi$, and therefore

```math
\overline{\mathcal R}(\Lambda,0,\phi)
=
\mathcal R(\Lambda^2,\phi).
```

Consequently the reduced Hamiltonian is

```math
\boxed{
H_{\rm gc}(\Lambda,\phi)
=
-\frac{1}{2\Lambda^2}
-\Lambda
-
\mathcal R(\Lambda^2,\phi)
}.
```

Since $\Gamma=0$,

```math
j=\Lambda,
```

so this may equivalently be written as

```math
\boxed{
H_{\rm gc}(j,\phi)
=
-\frac{1}{2j^2}
-j
-
\mathcal R(j^2,\phi)
}.
```

The canonical pair of the reduced system is therefore

```math
(\phi,j).
```

This provides the formal justification for the reduced Hamiltonian used in the application.

---

## 13. Guiding-center equations

Hamilton's equations give

```math
\dot\phi
=
\frac{\partial H_{\rm gc}}{\partial j},
```

and

```math
\dot j
=
-
\frac{\partial H_{\rm gc}}{\partial\phi}.
```

Therefore,

```math
\boxed{
\dot j
=
\frac{\partial\mathcal R}{\partial\phi}
}
```

and

```math
\boxed{
\dot\phi
=
\frac1{j^3}
-1
-
2j
\frac{\partial\mathcal R}{\partial r}
}.
```

For the circular guiding-center orbit,

```math
r=j^2.
```

Hence

```math
\dot r
=
2j\dot j.
```

Using $j=\sqrt r$ gives the two governing equations

```math
\boxed{
\dot r
=
2\sqrt r
\frac{\partial\mathcal R}{\partial\phi}
}
```

and

```math
\boxed{
\dot\phi
=
r^{-3/2}
-1
-
2\sqrt r
\frac{\partial\mathcal R}{\partial r}
}.
```

These equations evolve the guiding-center radius and the slow co-orbital angle.

They do not evolve an independent eccentricity or epicyclic phase.

---

## 14. Explicit derivatives of the disturbing function

The disturbing function is

```math
\mathcal R(r,\phi)
=
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2}
-
\frac1r,
```

with

```math
r_1^2
=
r^2+\mu^2+2\mu r\cos\phi,
```

and

```math
r_2^2
=
r^2+(1-\mu)^2
-2(1-\mu)r\cos\phi.
```

Its azimuthal derivative is

```math
\boxed{
\frac{\partial\mathcal R}{\partial\phi}
=
\mu(1-\mu)r\sin\phi
\left(
\frac1{r_1^3}
-
\frac1{r_2^3}
\right)
}.
```

Therefore,

```math
\boxed{
\dot r
=
2\mu(1-\mu)
r^{3/2}\sin\phi
\left(
\frac1{r_1^3}
-
\frac1{r_2^3}
\right)
}.
```

The radial derivative is

```math
\boxed{
\frac{\partial\mathcal R}{\partial r}
=
\frac1{r^2}
-
(1-\mu)
\frac{r+\mu\cos\phi}{r_1^3}
-
\mu
\frac{r-(1-\mu)\cos\phi}{r_2^3}
}.
```

Therefore,

```math
\boxed{
\begin{aligned}
\dot\phi
={}&
r^{-3/2}
-1
\\
&-
2\sqrt r
\left[
\frac1{r^2}
-
(1-\mu)
\frac{r+\mu\cos\phi}{r_1^3}
-
\mu
\frac{r-(1-\mu)\cos\phi}{r_2^3}
\right].
\end{aligned}
}
```

These analytic derivatives should be used directly in the numerical implementation.

---

## 15. Approximation conditions

The guiding-center equations are not an exact reduction of the PCR3BP.

They are a first-order fast-angle-averaged model in which the free epicyclic action is set to zero.

The approximation requires a separation between the fast epicyclic timescale and the slower guiding-center evolution.

### 15.1 Small non-Keplerian perturbation

The intended regime is

```math
\mu\ll1.
```

At fixed separation from the secondary, the disturbing potential is then small compared with the central Keplerian potential.

However, the approximation is not uniform near the secondary because derivatives of the perturbing potential grow rapidly as $r_2$ decreases.

---

### 15.2 Near-co-orbital motion

The model is intended for the vicinity of the 1:1 resonance,

```math
\Lambda\simeq1,
```

or equivalently

```math
r\simeq1.
```

The unperturbed slow-angle frequency is

```math
\dot\phi
=
r^{-3/2}-1.
```

The separation of timescales requires approximately

```math
|\dot\phi|\ll1,
```

so that the guiding-center angle changes slowly compared with the epicyclic frequency, which is of order unity.

---

### 15.3 Small free eccentricity

The eccentricity action satisfies

```math
\Gamma
\simeq
\frac12\Lambda e^2.
```

The reduced model assumes

```math
\Gamma\ll\Lambda,
```

or

```math
e\ll1.
```

The default model further chooses

```math
\Gamma=0
```

in the averaged Hamiltonian.

Thus the model removes the free eccentricity degree of freedom.

This does not imply that the full PCR3BP trajectory has exactly zero instantaneous eccentricity: the secondary can generate short-period forced oscillations that are absent from the reduced model.

---

### 15.4 Slow evolution of the guiding center

The angular momentum and guiding-center radius should evolve slowly compared with the orbital timescale.

A useful qualitative requirement is

```math
\left|
\frac{\dot j}{j}
\right|
\ll1,
```

or equivalently,

```math
\left|
\frac{\dot r}{r}
\right|
\ll1
```

on an orbital timescale.

This requirement may temporarily become less accurate during a horseshoe U-turn.

---

### 15.5 Avoidance of strong close encounters

Let

```math
d=r_2
```

be the distance from the secondary.

A useful measure of the local tidal strength of the secondary is

```math
\epsilon_{\rm tide}
=
\frac{\mu}{d^3}.
```

The most clearly controlled regime of the epicyclic averaging is

```math
\epsilon_{\rm tide}\ll1.
```

Equivalently,

```math
d\gg\mu^{1/3}.
```

Near the secondary's Hill scale,

```math
r_{\rm H}
\simeq
\left(
\frac{\mu}{3}
\right)^{1/3},
```

the tidal parameter is no longer asymptotically small.

Therefore trajectories whose horseshoe turns approach to only a few Hill radii may still be described qualitatively by the reduced model, but quantitative accuracy is not guaranteed and must be checked against the full PCR3BP.

The reduced model should not be used through a true close encounter or collision with the secondary.

---

## 16. Order and interpretation of the approximation

For a fixed distance from the secondary of order unity, the perturbation satisfies approximately

```math
\mathcal R=O(\mu).
```

Averaging over the fast epicyclic angle removes the first-order dependence on the fast phase.

The reduced Hamiltonian therefore represents the first-order averaged co-orbital dynamics on the zero-free-eccentricity manifold.

Corrections arise from:

- finite free eccentricity,
- forced short-period epicyclic motion,
- higher-order terms generated by the averaging transformation,
- rapid variation of the perturbation during close approaches,
- breakdown of the timescale separation.

Away from close encounters these corrections are higher order in the non-Keplerian perturbation.

Near the secondary, however, the expansion is not uniformly ordered by $\mu$ alone because the factors $1/r_2$, $1/r_2^2$, and $1/r_2^3$ can become large.

For this reason, statements such as “the approximation is first order in $\mu$” should only be understood for trajectories that remain sufficiently far from the secondary.

---

## 17. Simplified model near corotation

Near the corotation radius, write

```math
r=1+\xi,
\qquad
|\xi|\ll1.
```

Then

```math
r^{-3/2}-1
\simeq
-\frac32\xi.
```

The guiding-center equations become

```math
\dot\xi
\simeq
2
\frac{\partial\mathcal R}{\partial\phi},
```

and

```math
\dot\phi
\simeq
-\frac32\xi
-
2
\frac{\partial\mathcal R}{\partial r}.
```

If the perturbative correction to the angular frequency is additionally neglected,

```math
\boxed{
\dot\xi
\simeq
2
\frac{\partial\mathcal R}{\partial\phi}
}
```

and

```math
\boxed{
\dot\phi
\simeq
-\frac32\xi
}.
```

This simpler model represents approximately Keplerian shear plus gravitational torque.

It may be useful as an educational comparison model but is not the default numerical model.

---

## 18. Conserved quantity of the reduced model

Because the reduced equations are Hamiltonian in the canonical variables $(\phi,j)$,

```math
H_{\rm gc}
=
-\frac{1}{2j^2}
-j
-\mathcal R(j^2,\phi)
```

is conserved.

Using

```math
j=\sqrt r,
```

this becomes

```math
\boxed{
H_{\rm gc}(r,\phi)
=
-\frac1{2r}
-\sqrt r
-\mathcal R(r,\phi)
}.
```

This conserved quantity is an important numerical diagnostic.

Define

```math
\Delta H_{\rm gc}(t)
=
H_{\rm gc}(t)-H_{\rm gc}(0).
```

For a numerically accurate integration, $\Delta H_{\rm gc}$ should remain small.

Note that conservation of $H_{\rm gc}$ tests the numerical integration of the reduced model; it does not test the physical validity of the guiding-center approximation itself.

---

## 19. Relationship to the full PCR3BP

The reduced model is not intended to reproduce the instantaneous full trajectory point by point.

Instead, the expected relationship is schematically

```math
\text{full PCR3BP motion}
=
\text{guiding-center motion}
+
\text{forced/free epicyclic motion}
+
\text{higher-order corrections}.
```

The reduced model is intended to retain:

- horseshoe libration,
- tadpole libration,
- slow radial displacement of the guiding center,
- angular-momentum exchange with the secondary,
- horseshoe reversal,

while suppressing the independent free-epicyclic degree of freedom.

A central validation task for the application is therefore to compare the reduced trajectory with an appropriately filtered or averaged full PCR3BP trajectory.

---

## 20. Numerical diagnostics and validity indicators

The implementation should monitor both numerical accuracy and the expected validity of the approximation.

### 20.1 Reduced Hamiltonian error

Monitor

```math
\Delta H_{\rm gc}
=
H_{\rm gc}(t)-H_{\rm gc}(0).
```

---

### 20.2 Distance from the secondary

Monitor

```math
r_2(t)
```

and record

```math
r_{2,\min}.
```

---

### 20.3 Local tidal parameter

Monitor

```math
\epsilon_{\rm tide}(t)
=
\frac{\mu}{r_2(t)^3}.
```

This quantity provides a useful indication of where the fast-angle averaging becomes questionable.

No universal numerical threshold should be assumed before validation against the full PCR3BP.

---

### 20.4 Guiding-center radial evolution rate

Monitor

```math
\left|
\frac{\dot r}{r}
\right|.
```

Large values indicate reduced separation between the orbital and guiding-center timescales.

---

### 20.5 Positivity of the guiding-center radius

The numerical solution must satisfy

```math
r>0.
```

A solution reaching $r\le0$ represents numerical failure or use far outside the intended model domain.

---

## 21. Comparison mode with the full PCR3BP

The application should eventually integrate both

1. the full PCR3BP equations, and
2. the reduced guiding-center equations.

This comparison serves two distinct purposes:

- demonstrating visually how the epicyclic component is removed, and
- determining where the guiding-center approximation is quantitatively accurate.

The comparison should examine the dependence on

```math
\mu,
```

the horseshoe or tadpole amplitude,

```math
r_{2,\min},
```

and

```math
\epsilon_{\rm tide,max}.
```

For meaningful comparison, the full PCR3BP initial condition must be chosen to minimize free eccentricity.

The precise initialization and filtering procedure should be documented separately once adopted.

---

## 22. Current model status

The default reduced model is

```math
\boxed{
\dot r
=
2\sqrt r
\frac{\partial\mathcal R}{\partial\phi}
}
```

and

```math
\boxed{
\dot\phi
=
r^{-3/2}
-1
-
2\sqrt r
\frac{\partial\mathcal R}{\partial r}
}
```

with

```math
\mathcal R
=
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2}
-
\frac1r.
```

Here $r$ denotes the guiding-center radius,

```math
r=r_{\rm gc}=a=j^2,
```

not the instantaneous radial coordinate of the corresponding full PCR3BP trajectory.

The physical interpretation of the model is:

> a first-order fast-angle-averaged, zero-free-eccentricity approximation to the planar co-orbital restricted three-body problem.

Its controlled regime requires small non-Keplerian perturbations, slow co-orbital evolution relative to the epicyclic period, and avoidance of strong close encounters with the secondary.

The model should remain provisional until its accuracy has been quantified against appropriately initialized and filtered full PCR3BP trajectories.
