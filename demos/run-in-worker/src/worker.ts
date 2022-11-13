import * as THREE from "three";
import { MAX_PARTICLES } from "./settings";
import {
  Particles,
  ParticleRef,
  pSize,
  particleSphereCollisionDetection,
  collisionResponse,
} from "ptcl";

function initParticle(particle: ParticleRef) {
  particle.resetState();
  particle.setMass(2);
  particle.setPosition(0, 1, 0);
  particle.setVelocity(
    Math.random() - 0.5,
    Math.random() + 0.5,
    Math.random() - 0.5
  );
}

let particles: Particles | undefined = undefined;
onmessage = (event) => {
  const data = new Float32Array(event.data);
  const p = new Particles(MAX_PARTICLES, data);

  for (let particle of p) {
    initParticle(particle);
  }

  particles = p;
};

const geometry = new THREE.SphereGeometry(0.025, 8, 8);
const colliderGeometry = new THREE.SphereGeometry(1.0, 16, 16);
const colliderMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
collider.position.set(0, -1, 0);

const clock = new THREE.Clock();
setInterval(() => {
  const dt = clock.getDelta();
  if (particles !== undefined) {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      // apply gravity
      particles._addForce(i, 0, -10, 0);

      const particle = particles.get(i);
      const [collided, normal, penetration] = particleSphereCollisionDetection(
        particle,
        geometry,
        collider,
        colliderGeometry
      );
      if (collided) {
        collisionResponse(particle, normal, penetration);
      }

      // if we fall below -10 reset the particle
      if (particles.data[i * pSize + 1] < -10) {
        initParticle(particles.get(i));
      }
    }
    particles.integrate(dt);
  }
}, 16);
