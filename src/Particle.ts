import * as THREE from "three";

class Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;

  damping: number;
  inverseMass: number;

  forceAccum: THREE.Vector3;

  // temp var for debug
  mesh: undefined | THREE.Mesh;

  constructor(position = new THREE.Vector3(), mass = 5, damping = 0.8) {
    this.position = position;
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.forceAccum = new THREE.Vector3();
    this.damping = damping;
    this.setMass(mass);
  }

  addForce(force: THREE.Vector3) {
    this.forceAccum.add(force);
  }

  setMass(mass: number) {
    if (mass === 0.0) {
      throw new Error("Mass cannot be zero!");
    }
    this.inverseMass = 1 / mass;
  }

  getMass() {
    if (this.inverseMass === 0.0) {
      return Infinity;
    } else {
      return 1 / this.inverseMass;
    }
  }

  hasFiniteMass(): boolean {
    return this.inverseMass > 0.0;
  }

  integrate(dt: number) {
    if (this.inverseMass <= 0.0) return;

    if (dt < 0.0) {
      throw new Error("DeltaTime must be greater than 0");
    }

    // Update linear position
    this.position.addScaledVector(this.velocity, dt);

    // Work out the acceleration from the force
    this.acceleration.set(0,0,0);

    this.acceleration.addScaledVector(this.forceAccum, this.inverseMass);

    // Update linear velocity from the acceleration
    this.velocity.addScaledVector(this.acceleration, dt);

    // Impose drag
    this.velocity.multiplyScalar(Math.pow(this.damping, dt));

    this.clearAccumulator();
  }

  clearAccumulator() {
    this.forceAccum.set(0, 0, 0);
  }
}

export default Particle;
