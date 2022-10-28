import Particle from "./Particle";
import ParticleForceRegistry from "./ParticleForceRegistry";

class ParticleWorld {
  particles: Array<Particle>;
  registry : ParticleForceRegistry;

  constructor() {
    this.particles = [];
    this.registry = new ParticleForceRegistry();
  }

  addParticle(particle : Particle) {
    this.particles.push(particle);
  }

  removeParticle(particle : Particle) {
    for (let i = 0; i < this.particles.length; i++) {
      if (particle == this.particles[i]) {
        this.particles.splice(i, 1);
      }
    }
  }

  integrate(dt: number) : void {
    for (let particle of this.particles) {
      particle.integrate(dt);
    }
  }

  runPhysics(dt : number) : void {

    // TODO - update this to use force registry system
    this.registry.updateForces(dt);

    this.integrate(dt);

  }

  updateGraphics() {
    for (let particle of this.particles) {
      if (particle.mesh !== undefined) {
        particle.mesh.position.set(
        particle.position.x,
        particle.position.y,
        particle.position.z
        );
      }
    }
  }

}

export default ParticleWorld;
