# Physics Model

## 1. Purpose

This document defines the physical model used in the `cr3bp-guiding-center` web application.

The primary purpose of the application is to visualize co-orbital motion in the planar circular restricted three-body problem (PCR3BP), especially horseshoe and tadpole trajectories, while approximately removing the free epicyclic motion that appears in the full equations of motion.

The reduced model should retain the slow evolution of the guiding center caused by gravitational torque from the secondary body, while suppressing the independent eccentricity degree of freedom.

The equations and approximations defined here are the reference model for the implementation. Any modification of the governing equations should be reflected in this document.

---

# 2. Physical setup

We consider the planar circular restricted three-body problem.

There are two massive bodies,

\[
m_1,\qquad m_2,
\]

which move on circular orbits about their common center of mass.

A third body has negligible mass and therefore does not affect the motion of \(m_1\) and \(m_2\).

Define

\[
M=m_1+m_2,
\]

and the dimensionless mass ratio

\[
\mu=\frac{m_2}{m_1+m_2}.
\]

Thus,

\[
m_1=(1-\mu)M,
\qquad
m_2=\mu M.
\]

Usually,

\[
0<\mu\le \frac12,
\]

and the intended regime of the guiding-center approximation is primarily

\[
\mu\ll1.
\]

---

# 3. Nondimensionalization

We adopt the standard nondimensional units of the circular restricted three-body problem:

\[
a=1,
\]

\[
G(m_1+m_2)=1,
\]

\[
n=1,
\]

where \(a\) is the separation between the two massive bodies and \(n\) is their orbital angular frequency.

The orbital period of the binary is therefore

\[
T=2\pi.
\]

All lengths, times, angular frequencies, and gravitational potentials used in the application are expressed in these units.

---

# 4. Rotating coordinate system

We use a Cartesian coordinate system rotating with angular velocity

\[
\boldsymbol{\Omega}=\mathbf e_z.
\]

The origin is the center of mass of the two massive bodies.

The primary and secondary remain fixed at

\[
\mathbf r_1=(-\mu,0),
\]

\[
\mathbf r_2=(1-\mu,0).
\]

The position of the massless third body is

\[
(x,y).
\]

We also introduce rotating-frame polar coordinates

\[
x=r\cos\phi,
\qquad
y=r\sin\phi.
\]

Here \(\phi\) is measured in the rotating frame.

If \(\theta\) is the inertial azimuth,

\[
\theta=\phi+t,
\]

so that

\[
\dot\theta=1+\dot\phi.
\]

---

# 5. Distances from the massive bodies

The distance to \(m_1\) is

\[
r_1=
\sqrt{(x+\mu)^2+y^2},
\]

or equivalently,

\[
r_1^2
=
r^2+\mu^2+2\mu r\cos\phi.
\]

The distance to \(m_2\) is

\[
r_2=
\sqrt{(x-1+\mu)^2+y^2},
\]

or

\[
r_2^2
=
r^2+(1-\mu)^2
-2(1-\mu)r\cos\phi.
\]

---

# 6. Full PCR3BP equations

The effective potential in the rotating frame is

\[
\Omega(x,y)
=
\frac12(x^2+y^2)
+
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2}.
\]

The exact planar equations of motion are

\[
\ddot x-2\dot y
=
\frac{\partial\Omega}{\partial x},
\]

\[
\ddot y+2\dot x
=
\frac{\partial\Omega}{\partial y}.
\]

Explicitly,

\[
\ddot x-2\dot y
=
x
-
(1-\mu)\frac{x+\mu}{r_1^3}
-
\mu\frac{x-1+\mu}{r_2^3},
\]

\[
\ddot y+2\dot x
=
y
-
(1-\mu)\frac{y}{r_1^3}
-
\mu\frac{y}{r_2^3}.
\]

These equations retain all planar degrees of freedom of the PCR3BP, including eccentric or epicyclic motion.

---

# 7. Exact equations in rotating polar coordinates

In rotating-frame polar coordinates,

\[
x=r\cos\phi,
\qquad
y=r\sin\phi,
\]

the exact equations are

\[
\ddot r-r\dot\phi^2-2r\dot\phi
=
\frac{\partial\Omega}{\partial r},
\]

\[
r\ddot\phi
+
2\dot r\dot\phi
+
2\dot r
=
\frac1r
\frac{\partial\Omega}{\partial\phi}.
\]

Equivalently, defining the gravitational part

\[
U(r,\phi)
=
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2},
\]

the azimuthal equation can be written as an exact angular-momentum equation.

The inertial-frame specific angular momentum is

\[
j
=
r^2(1+\dot\phi).
\]

It satisfies

\[
\boxed{
\dot j
=
\frac{\partial U}{\partial\phi}
}.
\]

This relation is exact.

---

# 8. Separation into a Keplerian reference potential and a perturbation

We write

\[
U(r,\phi)
=
\frac1r+\mathcal R(r,\phi),
\]

where

\[
\boxed{
\mathcal R(r,\phi)
=
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2}
-
\frac1r
}.
\]

This decomposition is algebraically exact for any \(\mu\).

However, treating \(\mathcal R\) as a perturbation to the Keplerian potential is intended mainly for

\[
\mu\ll1
\]

and away from very close encounters with the secondary.

In the limit

\[
\mu\rightarrow0,
\]

we have

\[
\mathcal R\rightarrow0.
\]

---

# 9. Physical meaning of the guiding-center approximation

The full PCR3BP has four planar phase-space variables,

\[
(r,\phi,\dot r,\dot\phi),
\]

and therefore contains an independent eccentricity or epicyclic degree of freedom.

Even when a particle is initialized close to a circular orbit, perturbations from the secondary generally excite a free epicycle.

The resulting motion can schematically be written as

\[
r_{\rm physical}(t)
=
r_{\rm gc}(t)
+
\delta r_{\rm epi}(t),
\]

where

\[
\delta r_{\rm epi}
\sim
e\cos(\kappa t+\psi).
\]

The goal of the reduced model is to remove this free epicyclic component and evolve only the slow guiding-center motion.

In this model, \(r\) should therefore be interpreted primarily as a guiding-center radius rather than the instantaneous physical radius of the full PCR3BP trajectory.

The approximation assumes that the orbit remains close to the family of circular Keplerian orbits while its angular momentum changes slowly due to the perturbing torque.

---

# 10. Circular-orbit constraint

For the Kepler potential

\[
U_0=\frac1r,
\]

the specific angular momentum of a circular orbit is

\[
j_{\rm c}(r)=\sqrt r.
\]

The guiding-center approximation imposes

\[
\boxed{
j=\sqrt r
}
\]

at all times.

This does not imply

\[
\dot r=0.
\]

Instead, the angular momentum is allowed to evolve under the perturbing torque, and the guiding-center radius changes accordingly.

Differentiating

\[
j=\sqrt r
\]

gives

\[
\dot j
=
\frac{1}{2\sqrt r}\dot r.
\]

Since the axisymmetric term \(1/r\) has no \(\phi\)-dependence,

\[
\dot j
=
\frac{\partial\mathcal R}{\partial\phi}.
\]

Therefore,

\[
\boxed{
\dot r
=
2\sqrt r
\frac{\partial\mathcal R}{\partial\phi}
}.
\]

This equation describes radial migration of the guiding center caused by the gravitational torque.

---

# 11. Reduced guiding-center Hamiltonian

Using the inertial specific angular momentum \(j\), the rotating-frame Hamiltonian can be reduced by eliminating the radial epicyclic degree of freedom.

The resulting guiding-center Hamiltonian is

\[
\boxed{
H_{\rm gc}(j,\phi)
=
-\frac{1}{2j^2}
-j
-\mathcal R(j^2,\phi)
}.
\]

The canonical variables are

\[
(\phi,j).
\]

Hamilton's equations are

\[
\dot\phi
=
\frac{\partial H_{\rm gc}}{\partial j},
\]

\[
\dot j
=
-\frac{\partial H_{\rm gc}}{\partial\phi}.
\]

Therefore,

\[
\dot j
=
\frac{\partial\mathcal R}{\partial\phi},
\]

and

\[
\dot\phi
=
\frac1{j^3}
-1
-
2j
\frac{\partial\mathcal R}{\partial r}.
\]

Using

\[
j=\sqrt r,
\]

we obtain the main reduced equations used by the application:

\[
\boxed{
\dot r
=
2\sqrt r
\frac{\partial\mathcal R}{\partial\phi}
}
\]

and

\[
\boxed{
\dot\phi
=
r^{-3/2}
-1
-
2\sqrt r
\frac{\partial\mathcal R}{\partial r}
}.
\]

These two first-order equations constitute the default guiding-center model.

---

# 12. Explicit derivatives of the disturbing function

The azimuthal derivative is

\[
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
\]

Therefore,

\[
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
\]

The radial derivative is

\[
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
\]

Therefore,

\[
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
\]

These explicit expressions should be used directly in the numerical implementation unless there is a specific reason to evaluate the derivatives numerically.

---

# 13. Simplified leading-order model near corotation

Near the corotation radius,

\[
r=1+\xi,
\qquad
|\xi|\ll1.
\]

Then,

\[
r^{-3/2}-1
\simeq
-\frac32\xi.
\]

The guiding-center equations become approximately

\[
\dot\xi
\simeq
2
\frac{\partial\mathcal R}{\partial\phi},
\]

\[
\dot\phi
\simeq
-\frac32\xi
-
2
\frac{\partial\mathcal R}{\partial r}.
\]

An even simpler approximation neglects the perturbative contribution to the azimuthal frequency:

\[
\boxed{
\dot\xi
\simeq
2
\frac{\partial\mathcal R}{\partial\phi}
}
\]

\[
\boxed{
\dot\phi
\simeq
-\frac32\xi
}.
\]

This simplified model corresponds approximately to Keplerian shear plus gravitational torque.

It may be useful for educational visualization, but it is not the default numerical model.

---

# 14. Interpretation of the two terms in \(\dot\phi\)

The guiding-center azimuthal equation is

\[
\dot\phi
=
r^{-3/2}-1
-
2\sqrt r
\frac{\partial\mathcal R}{\partial r}.
\]

The first term,

\[
r^{-3/2}-1,
\]

is the differential Keplerian angular velocity relative to the rotating frame.

Thus,

\[
r>1
\quad\Rightarrow\quad
\dot\phi<0
\]

in the unperturbed problem, while

\[
r<1
\quad\Rightarrow\quad
\dot\phi>0.
\]

The second term,

\[
-2\sqrt r
\frac{\partial\mathcal R}{\partial r},
\]

is the correction to the guiding-center angular frequency caused by the perturbing gravitational potential.

This term may become important during a horseshoe turn and should be retained in the default model.

---

# 15. Conserved quantity of the reduced system

Because the reduced system is Hamiltonian in the canonical variables

\[
(\phi,j),
\]

the quantity

\[
H_{\rm gc}
=
-\frac{1}{2j^2}
-j
-\mathcal R(j^2,\phi)
\]

is conserved.

Using

\[
j=\sqrt r,
\]

this becomes

\[
\boxed{
H_{\rm gc}(r,\phi)
=
-\frac1{2r}
-\sqrt r
-\mathcal R(r,\phi)
}.
\]

This conserved quantity should be used as an important numerical diagnostic.

For a sufficiently accurate integration,

\[
H_{\rm gc}(t)
\]

should remain nearly constant.

---

# 16. Relationship to the full PCR3BP

The reduced model is not intended to reproduce the instantaneous full trajectory point by point.

Instead, it is intended to reproduce the slow co-orbital motion of the guiding center after the free epicyclic degree of freedom has been removed.

The expected qualitative relationship is

\[
\text{full PCR3BP trajectory}
=
\text{guiding-center motion}
+
\text{epicyclic motion}
+
\text{higher-order corrections}.
\]

The reduced model should retain features such as

- horseshoe libration,
- tadpole libration,
- radial displacement of the guiding center,
- angular-momentum exchange with the secondary,
- reversal at horseshoe turns,

while suppressing

- free eccentricity,
- free epicyclic oscillation,
- dependence on an independent radial epicyclic phase.

---

# 17. Important assumptions

The guiding-center model relies on the following assumptions.

## 17.1 Small secondary mass

The intended regime is primarily

\[
\mu\ll1.
\]

This makes the non-axisymmetric part of the potential a perturbation to the central Keplerian potential.

## 17.2 Small free eccentricity

The free eccentricity is assumed to be approximately zero.

The model does not evolve an independent eccentricity variable.

## 17.3 Slow guiding-center evolution

The guiding center is assumed to evolve more slowly than the local orbital period, except possibly during relatively rapid horseshoe turns.

## 17.4 No close collision with the secondary

The model should not be trusted arbitrarily close to

\[
r_2=0.
\]

Near a true close encounter, the perturbation is no longer weak and the separation between slow guiding-center motion and fast epicyclic motion becomes questionable.

---

# 18. Behaviour near the secondary

Near the secondary, let the separation be

\[
d\sim r_2.
\]

The secondary potential scales as

\[
\frac{\mu}{d}.
\]

For a characteristic Hill-scale separation,

\[
d\sim r_{\rm H}\sim\mu^{1/3},
\]

the perturbing potential scales as

\[
\frac{\mu}{d}
\sim
\mu^{2/3},
\]

while the perturbing gravitational acceleration scales as

\[
\frac{\mu}{d^2}
\sim
\mu^{1/3}.
\]

Thus, even when the perturbing potential remains formally small, its spatial gradient can become dynamically important during a horseshoe turn.

This is one reason the torque term can significantly change the guiding-center radius even when \(\mu\ll1\).

---

# 19. Numerical implementation variables

The default reduced-system state vector is

\[
\mathbf y
=
(r,\phi).
\]

Its evolution is

\[
\frac{d\mathbf y}{dt}
=
\begin{pmatrix}
f_r(r,\phi)\\
f_\phi(r,\phi)
\end{pmatrix},
\]

where

\[
f_r
=
2\sqrt r
\frac{\partial\mathcal R}{\partial\phi},
\]

\[
f_\phi
=
r^{-3/2}-1
-
2\sqrt r
\frac{\partial\mathcal R}{\partial r}.
\]

For visualization in the rotating Cartesian plane,

\[
x=r\cos\phi,
\]

\[
y=r\sin\phi.
\]

The angular momentum associated with the reduced model is

\[
j=\sqrt r.
\]

The gravitational torque is

\[
\tau
=
\dot j
=
\frac{\partial\mathcal R}{\partial\phi}.
\]

These quantities may all be displayed in the application.

---

# 20. Recommended numerical diagnostics

The implementation should monitor at least the following quantities.

## 20.1 Reduced Hamiltonian error

Define

\[
\Delta H_{\rm gc}(t)
=
H_{\rm gc}(t)-H_{\rm gc}(0).
\]

The relative or absolute drift should remain small compared with the physical variations being visualized.

## 20.2 Minimum distance to the secondary

Monitor

\[
r_{2,\min}.
\]

If the trajectory approaches too close to the secondary, the application should warn that the guiding-center approximation may no longer be reliable.

## 20.3 Positivity of \(r\)

The numerical solution must satisfy

\[
r>0.
\]

A trajectory producing \(r\le0\) indicates numerical failure or use far outside the intended model domain.

---

# 21. Comparison mode with the full PCR3BP

A later version of the application should integrate both

1. the full PCR3BP equations, and
2. the reduced guiding-center equations.

The purpose is to visualize directly the difference between the physical trajectory and its approximate guiding-center motion.

For meaningful comparison, the initialization procedure for the full PCR3BP must be defined carefully.

The full trajectory should initially correspond as closely as possible to a zero-free-eccentricity orbit associated with the selected guiding-center state.

The exact initialization prescription for this comparison mode should be documented separately once adopted.

---

# 22. Current model status

The default physical model of the application is

\[
\boxed{
\dot r
=
2\sqrt r
\frac{\partial\mathcal R}{\partial\phi}
}
\]

\[
\boxed{
\dot\phi
=
r^{-3/2}
-1
-
2\sqrt r
\frac{\partial\mathcal R}{\partial r}
}
\]

with

\[
\mathcal R
=
\frac{1-\mu}{r_1}
+
\frac{\mu}{r_2}
-
\frac1r,
\]

\[
r_1^2
=
r^2+\mu^2+2\mu r\cos\phi,
\]

\[
r_2^2
=
r^2+(1-\mu)^2
-2(1-\mu)r\cos\phi.
\]

The intended interpretation is a zero-free-eccentricity, co-orbital guiding-center approximation to the planar circular restricted three-body problem.

This model should be considered provisional until it has been validated quantitatively against suitably filtered or averaged trajectories from the full PCR3BP.
