import * as THREE from "three";
import { Particles } from "./Particles";

function addParticleGravity(particles: Particles, acceleration = new THREE.Vector3(0,-10,0)){
	for (let particle of particles){
		if (particle.hasFiniteMass()){
			const force = acceleration.multiplyScalar(particle.getMass());
			particle.addForce(force.x,force.y,force.z);
		}
	}
}

function addParticleDrag(particles: Particles, k1s: Array<number>, k2s: Array<number>){
	for (let particle of particles){
		let force = particle.getVelocity();
		let dragCoeff = force.length();
		dragCoeff = k1s[particle.pIndex] * dragCoeff + k2s[particle.pIndex] * dragCoeff * dragCoeff;
		force.normalize();
		force.multiplyScalar(-dragCoeff);
		particle.addForce(force.x,force.y,force.z);
	}
}

function addParticleAttractor(particles: Particles, attractor: THREE.Vector3, norms: Array<number>){
	for (let particle of particles){
		let force = attractor.clone();
		force.addScaledVector(particle.getPosition(), -1);
		force.normalize();
		force.multiplyScalar(norms[particle.pIndex]);
		particle.addForce(force.x,force.y,force.z);
	}
}

export {
	addParticleGravity,
	addParticleDrag,
	addParticleAttractor,
};