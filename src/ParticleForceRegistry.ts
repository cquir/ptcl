import Particle from "./Particle";
import { ParticleForceGenerator } from "./ParticleForceGenerator";

// slow but follows book nicely so keeping
interface ParticleForceRegistration {
  particle: Particle;
  fg: ParticleForceGenerator;
}

class ParticleForceRegistry {

  registrations : Array<ParticleForceRegistration>;

  constructor() {
    this.registrations = [];
  }

  add(particle : Particle, fg : ParticleForceGenerator) : void {
    this.registrations.push({
      particle: particle,
      fg: fg
    });
  }

  remove(particle : Particle, fg : ParticleForceGenerator) : void {
    for (let i = 0; i < this.registrations.length; i++) {
      let pfr = this.registrations[i];
      if (pfr.particle === particle && pfr.fg === fg) {
        this.registrations.splice(i, 1);
      }
    }
  }

  clear() {
    this.registrations = [];
  }

  updateForces(dt : number) {
    for (let i = 0; i < this.registrations.length; i++) {
      this.registrations[i].fg.updateForce(this.registrations[i].particle, dt)
    }
  }

}

export default ParticleForceRegistry;
