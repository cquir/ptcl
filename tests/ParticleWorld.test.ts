import * as THREE from "three";
import {Particle,ParticleWorld} from "../src";

function addParticle(particle) {
	const world = new ParticleWorld();
	world.addParticle(particle);
	return world.particles[0];
}

test("add particle", () => {
	const p = new Particle();
	expect(addParticle(p)).toEqual(p); 
});

function removeParticle(particle) {
	const world = new ParticleWorld();
	world.addParticle(particle);
	world.removeParticle(particle);
	return world.particles.length;
}

test("remove particle", () => {
	const p = new Particle();
	expect(removeParticle(p)).toBe(0);
});

function integrate(particle,dt) {
	const world = new ParticleWorld();
	world.addParticle(particle)
	world.integrate(dt)
	return world.particles[0].position
}

test("update all particles", () => {
	const p = new Particle();
	p.velocity = new THREE.Vector3(1,0,0)
	const position = new THREE.Vector3(0.1,0,0)	
	expect(integrate(p,0.1)).toEqual(position)
});
