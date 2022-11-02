import * as THREE from "three";
import {Particle,ParticleGravity,ParticleDrag,ParticleAttractor} from "../src";

function updateGravityForce(mass:number,gravity:THREE.Vector3,dt:number) {
	const p = new Particle();
	p.setMass(mass);
	const fg = new ParticleGravity(gravity);
	fg.updateForce(p,dt);
	return p.forceAccum;
}

test("update gravity force", () => {
	const mass = 2;
	const gravity = new THREE.Vector3(0,-10,0);
	const dt = 0.1;
	const forceAccum = new THREE.Vector3(0,-20,0);
	expect(updateGravityForce(mass,gravity,dt)).toEqual(forceAccum);
});

function updateDrag(velocity:THREE.Vector3,k1:number,k2:number,dt:number) {
	const p = new Particle();
	p.velocity = velocity;
	const fg = new ParticleDrag(k1,k2);
	fg.updateForce(p,dt);
	return p.forceAccum;
}

test("update drag", () => {
	const velocity = new THREE.Vector3(2,0,0);
	const k1 = 3;
	const k2 = 4;
	const dt = 0.1
	const forceAccum = new THREE.Vector3(-22,0,0);
	expect(updateDrag(velocity,k1,k2,dt)).toEqual(forceAccum);
});

function updateAttractorForce(position:THREE.Vector3,attractor:THREE.Vector3,norm:number,dt:number) {
	const p = new Particle();
	p.position = position;
	const fg = new ParticleAttractor(attractor,norm);
	fg.updateForce(p,dt);
	return p.forceAccum;
}

test("update attractor force", () => {
	const position = new THREE.Vector3();
	const attractor = new THREE.Vector3(0,1,0);
	const norm = 10;
	const dt = 0.1;
	const forceAccum = new THREE.Vector3(0,10,0);
	expect(updateAttractorForce(position,attractor,norm,dt)).toEqual(forceAccum);
});
