import * as THREE from "three";

//0-2: position, 3-5: velocity, 6-8: acceleration (forceAccum is redundant), 9: damping, 10: 1/mass, 11-13: forceAccum
const pSize = 14;

class ParticleRef {
  // particle index
  pIndex: number;
  particles: Particles;

  constructor(i: number, particles: Particles) {
    this.pIndex = i;
    // keep a reference to the main particles class
    // which stores the particle buffer data structure
    this.particles = particles;
  }

  setPosition(x: number, y: number, z: number) {
    this.particles._setPosition(this.pIndex, x, y, z);
  }

  setVelocity(x: number, y: number, z: number) {
    this.particles._setVelocity(this.pIndex, x, y, z);
  }

  setAcceleration(x: number, y: number, z: number) {
    this.particles._setAcceleration(this.pIndex, x, y, z);
  }

  addForce(x: number, y: number, z: number) {
    this.particles._addForce(this.pIndex, x, y, z);
  }

  addPosition(x: number, y: number, z: number) {
    this.particles._addPosition(this.pIndex, x, y, z);
  }

  addVelocity(x: number, y: number, z: number) {
    this.particles._addVelocity(this.pIndex, x, y, z);
  }

  setDamping(damping: number) {
    this.particles._setDamping(this.pIndex, damping);
  }

  setMass(mass: number) {
    this.particles._setMass(this.pIndex, mass);
  }

  getPosition() {
    return this.particles._getPosition(this.pIndex);
  }

  getVelocity() {
    return this.particles._getVelocity(this.pIndex);
  }

  getAcceleration() {
    return this.particles._getAcceleration(this.pIndex);
  }

  resetState() {
    this.particles._resetState(this.pIndex);
  }

  getMass(): number {
    return this.particles._getMass(this.pIndex);
  }

  hasFiniteMass() {
    return this.particles._hasFiniteMass(this.pIndex);
  }
}

class ParticleIterator implements Iterator<ParticleRef> {
  cursor: number;
  particles: Particles;

  constructor(particles: Particles) {
    this.cursor = 0;
    this.particles = particles;
  }

  next(): IteratorResult<ParticleRef> {
    if (this.cursor >= this.particles.maxParticles) {
      return {
        value: null,
        done: true,
      };
    }

    return {
      value: this.particles.get(this.cursor++),
      done: false,
    };
  }
}

// TODO rename this class and the other classes because name sux
// 			everything probably needs rethinking though so no rush I suppose
//
// I also decided to prefixed all the methods on this class to make it somewhat clear
// that you are calling an internal component of the library, _ before a method indicates an
// internal method usually but in this case I am just signaling to be careful calling it directly
//
class Particles {
  maxParticles: number;
  data: Float32Array;
  constantForceAccum: THREE.Vector3;

  constructor(maxParticles: number, data?: Float32Array) {
    this.maxParticles = maxParticles;
    if (data !== undefined && data instanceof Float32Array) {
      this.data = data;
    } else {
      this.data = new Float32Array(maxParticles * pSize);
    }

    // initialize damping
    for (let i = 0; i < maxParticles * pSize; i += pSize) {
      this.data[i + 9] = 0.9999; // default damping
    }

    this.constantForceAccum = new THREE.Vector3(0, 0, 0);
  }

  _setPosition(i: number, x: number, y: number, z: number) {
    this.data[i * pSize] = x;
    this.data[i * pSize + 1] = y;
    this.data[i * pSize + 2] = z;
  }

  _setVelocity(i: number, x: number, y: number, z: number) {
    this.data[i * pSize + 3] = x;
    this.data[i * pSize + 4] = y;
    this.data[i * pSize + 5] = z;
  }

  _setAcceleration(i: number, x: number, y: number, z: number) {
    this.data[i * pSize + 6] = x;
    this.data[i * pSize + 7] = y;
    this.data[i * pSize + 8] = z;
  }

  _setDamping(i: number, damping: number) {
    this.data[i * pSize + 9] = damping;
  }

  _setMass(i: number, mass: number) {
    if (mass == 0) {
      throw new Error("Mass cannot be zero!");
    }
    this.data[i * pSize + 10] = 1 / mass;
  }

  _getMass(i: number): number {
    const inverseMass = this.data[i * pSize + 10];
    if (inverseMass == 0) {
      return Infinity;
    } else {
      return 1 / inverseMass;
    }
  }

  _hasFiniteMass(i: number) {
    return this.data[i * pSize + 10] > 0;
  }

  _addForce(i: number, x: number, y: number, z: number) {
    // update forceAccum
    this.data[i * pSize + 11] += x;
    this.data[i * pSize + 12] += y;
    this.data[i * pSize + 13] += z;
  }

  _addPosition(i: number, x: number, y: number, z: number) {
    this.data[i * pSize + 0] += x;
    this.data[i * pSize + 1] += y;
    this.data[i * pSize + 2] += z;
  }

  _addVelocity(i: number, x: number, y: number, z: number) {
    this.data[i * pSize + 3] += x;
    this.data[i * pSize + 4] += y;
    this.data[i * pSize + 5] += z;
  }

  _addGlobalConstantForce(x: number, y: number, z: number) {
    // update forceAccum
    this.constantForceAccum.x += x;
    this.constantForceAccum.y += y;
    this.constantForceAccum.z += z;
  }

  integrate(dt: number) {
    for (let i = 0; i < this.maxParticles; i++) {
      // Update linear position: pos += vel * dt
      this.data[i * pSize + 0] += dt * this.data[i * pSize + 3]; // x
      this.data[i * pSize + 1] += dt * this.data[i * pSize + 4]; // y
      this.data[i * pSize + 2] += dt * this.data[i * pSize + 5]; // z

      // Work out acceleration from the force
      const inverseMass = this.data[i * pSize + 10];
      this.data[i * pSize + 6] = this.data[i * pSize + 11] * inverseMass;
      this.data[i * pSize + 7] = this.data[i * pSize + 12] * inverseMass;
      this.data[i * pSize + 8] = this.data[i * pSize + 13] * inverseMass;

      // Update velocity
      this.data[i * pSize + 3] += dt * this.data[i * pSize + 6];
      this.data[i * pSize + 4] += dt * this.data[i * pSize + 7];
      this.data[i * pSize + 5] += dt * this.data[i * pSize + 8];

      // Impose drag
      this.data[i * pSize + 3] *= Math.pow(this.data[i * pSize + 9], dt);
      this.data[i * pSize + 4] *= Math.pow(this.data[i * pSize + 9], dt);
      this.data[i * pSize + 5] *= Math.pow(this.data[i * pSize + 9], dt);

      // clear forceAccum
      this.data[i * pSize + 11] = this.constantForceAccum.x;
      this.data[i * pSize + 12] = this.constantForceAccum.y;
      this.data[i * pSize + 13] = this.constantForceAccum.z;

    }
  }

  _getPosition(i: number): THREE.Vector3 {
    return new THREE.Vector3(
      this.data[i * pSize + 0],
      this.data[i * pSize + 1],
      this.data[i * pSize + 2]
    );
  }

  _getVelocity(i: number): THREE.Vector3 {
    return new THREE.Vector3(
      this.data[i * pSize + 3],
      this.data[i * pSize + 4],
      this.data[i * pSize + 5]
    );
  }

  _getAcceleration(i: number): THREE.Vector3 {
    return new THREE.Vector3(
      this.data[i * pSize + 6],
      this.data[i * pSize + 7],
      this.data[i * pSize + 8]
    );
  }

  _resetState(i: number): void {
    for (let j = 0; j < pSize; j++) {
      if (j !== 9) {
        this.data[i * pSize + j] = 0;
      }
    }
  }

  get(i: number): ParticleRef {
    return new ParticleRef(i, this);
  }

  [Symbol.iterator]() {
    return new ParticleIterator(this);
  }
}

export { Particles, ParticleRef, pSize };
