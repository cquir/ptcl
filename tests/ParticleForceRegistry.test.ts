import * as THREE from "three";
import {Particle,ParticleWorld,ParticleForceGenerator,ParticleGravity} from "../src";

function addParticleForce(p:Particle,fg:ParticleForceGenerator) {
	const world = new ParticleWorld();
	world.registry.add(p,fg);
	return world.registry.registrations[0];
}

test("add particle force pair to registry", () => {
	const p = new Particle();
	const fg = new ParticleGravity(new THREE.Vector3(0,-10,0));
	expect(addParticleForce(p,fg).particle).toEqual(p);
	expect(addParticleForce(p,fg).fg).toEqual(fg);
});

function removeParticleForce(p:Particle,fg:ParticleForceGenerator) {
	const world = new ParticleWorld();
	world.registry.add(p,fg);
	world.registry.remove(p,fg);
	return world.registry.registrations.length;
}

test("remove particle force pair from registry", () => {
	const p = new Particle();
	const fg = new ParticleGravity(new THREE.Vector3(0,-10,0));
	expect(removeParticleForce(p,fg)).toBe(0);
});

function clearAllParticleForce(p:Particle,p2:Particle,fg:ParticleForceGenerator) {
	const world = new ParticleWorld(); 
	world.registry.add(p,fg);
	world.registry.add(p2,fg);
	world.registry.clear()
	return world.registry.registrations.length;
}

test("clear all particle force pairs from registry", () => {
	const p = new Particle();
	const p2 = new Particle();
	const fg = new ParticleGravity(new THREE.Vector3(0,-10,0));
	expect(clearAllParticleForce(p,p2,fg)).toBe(0);
});

function updateForces(p:Particle,fg:ParticleForceGenerator,dt:number) {
	const world = new ParticleWorld();
	world.registry.add(p,fg);
	world.registry.updateForces(dt);
	return p.forceAccum;
};

test("update forces applied to particles in registry", () => {
	const p = new Particle();
	p.setMass(2)
	const fg = new ParticleGravity(new THREE.Vector3(0,-10,0));
	const forceAccum = new THREE.Vector3(0,-20,0);
	expect(updateForces(p,fg,0.1)).toEqual(forceAccum);
});
