// TODO: figure out how we want to deal with force generators with new data structure

/**

import * as THREE from "three";
import Particle from "./Particle";


interface ParticleForceGenerator {
  updateForce(particle: Particle, dt: number): void;
}

class ParticleGravity implements ParticleForceGenerator {
  gravity: THREE.Vector3;

  constructor(gravity: THREE.Vector3) {
    this.gravity = gravity;
  }

  updateForce(particle: Particle, dt: number): void {
    if (!particle.hasFiniteMass()) return;

    // dt not used since it is applied when forces are eval-ed
    particle.addForce(this.gravity.clone().multiplyScalar(particle.getMass()));
  }
}

class ParticleDrag implements ParticleForceGenerator {
  // Holds the velocity drag coeffificent.
  k1: number;

  // Holds the velocity squared drag coeffificent.
  k2: number;

  constructor(k1: number, k2: number) {
    this.k1 = k1;
    this.k2 = k2;
  }

  updateForce(particle: Particle, dt: number): void {
    const force = particle.velocity.clone();

    // Calculate the total drag coefficient
    let dragCoeff: number = force.length();
    dragCoeff = this.k1 * dragCoeff + this.k2 * dragCoeff * dragCoeff;

    // Calculate the final force and apply it
    force.normalize();
    force.multiplyScalar(-dragCoeff);

    particle.addForce(force);
  }
}

class ParticleAttractor implements ParticleForceGenerator {
  attractor: THREE.Vector3;
  norm: number;

  constructor(attractor: THREE.Vector3, norm: number) {
    this.attractor = attractor;
    this.norm = norm;
  }

  updateForce(particle: Particle, dt: number): void {
    const force = this.attractor.clone();
    force.addScaledVector(particle.position.clone(), -1);
    force.normalize();

    force.multiplyScalar(this.norm);
    particle.addForce(force);
  }
}

export {
  ParticleForceGenerator,
  ParticleGravity,
  ParticleDrag,
  ParticleAttractor,
};

**/
