The goal of this demo is to show an example where the particle attractive force generator is used. This force pulls the particle towards an attraction point. We will use this to create an animation of the solar system. 

The orbital periods of the planets [[1]](https://en.wikipedia.org/wiki/Orbital_period) in terms of $\text{yr}$ are scaled so that $1\,\text{yr}$ is equivalent to $30\,\text{s}$ in the demo using the following code:

```ts
const periods = [0.240846,0.615,1,1.881,11.86,29.46,84.01,164.8].map(x => x*30);
```

The attractive force (instead of gravity) will serve as the centripetal force keeping the particles (planets) in orbits. $F_c$ the norm (magnitude) of the centripetal force is related to the orbital period $T$ by the following relation [[2]](https://en.wikipedia.org/wiki/Centripetal_force):

$$F_c=mr\left(\frac{2\pi}{T}\right)^2$$

where $m$ is the mass and $r$ is the radius of curvature. For sake of simplicity, $m$ is set to ``1`` and $r$ to ``0.5*i+2`` where ``i`` is the planet's index. 

The attractive force can then be added to each particle (planet) using the following code:

```ts
const forceNorm = radius*(2*Math.PI/period)**2;
const attractor = new THREE.Vector3(0,0,0);
world.registry.add(p, new ParticleAttractor(attractor,forceNorm));
```

$F_c$ is related to the tangential speed $v$ by the following relation [[2]](https://en.wikipedia.org/wiki/Centripetal_force):

$$F_c=\frac{mv^2}{r}$$

The particle's initial velocity can then be determined using the following code:

```ts
const speed = Math.sqrt(radius*forceNorm);
const direction = new THREE.Vector3(0,0,1);
p.velocity.addScaledVector(direction, speed);
```

where here we are using the fact that the direction vector  ``THREE.Vector3(0,0,1)`` is perpendicular to the vector between the attraction point ``THREE.Vector3(0,0,0)`` and the particle's initial position ``THREE.Vector3(-radius,0,0)``.
