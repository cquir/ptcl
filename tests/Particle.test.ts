import * as THREE from "three";
import { Particle } from "../src";

test("add force", () => {
  const force = new THREE.Vector3(0, -20, 0);

  const p = new Particle();
  p.addForce(force);

  expect(p.forceAccum.toArray()).toEqual(force.toArray());
});

test("set mass", () => {
  const p = new Particle();
  p.setMass(2);

  expect(p.inverseMass).toBe(0.5);
});

test("retrieve mass (finite case)", () => {
  const p = new Particle();
  p.inverseMass = 0.5

  expect(p.getMass()).toBe(2);
});

test("retrieve mass (infinite case)", () => {
   const p = new Particle();
   p.inverseMass = 0;	

   expect(p.getMass()).toBe(Infinity);
});

function hasFiniteMass(inverseMass : number) {
  const p = new Particle();
  p.inverseMass = inverseMass;
  return p.hasFiniteMass();
}

test("determine if mass is finite (true case)", () => {
  expect(hasFiniteMass(0.5)).toBe(true);
});

test("determine if mass is finite (false case)", () => {
  expect(hasFiniteMass(0)).toBe(false);
});

function integratePosition(dt : number, velocity : THREE.Vector3) {
  const p = new Particle();
  p.velocity = velocity;
  p.integrate(dt);
  return p.position.toArray();
}

test("update linear position", () => {
  const velocity = new THREE.Vector3(1, 0, 0);
  const position = new THREE.Vector3(0.1, 0, 0);
  expect(integratePosition(0.1, velocity)).toEqual(position.toArray());
});

function integrateAcceleration(dt : number, forceAccum : THREE.Vector3, inverseMass : number) {
  const p = new Particle();
  p.forceAccum = forceAccum;
  p.inverseMass = inverseMass;
  p.integrate(dt);
  return p.acceleration.toArray();
}

test("work out the acceleration from the force", () => {
  const forceAccum = new THREE.Vector3(0, -20, 0);
  const acceleration = new THREE.Vector3(0, -10, 0);
  expect(integrateAcceleration(0.1, forceAccum, 0.5)).toEqual(
    acceleration.toArray()
  );
});

function integrateVelocity(dt : number, forceAccum : THREE.Vector3, inverseMass : number) {
  const p = new Particle();
  p.forceAccum = forceAccum;
  p.inverseMass = inverseMass;
  p.damping = 1;
  p.integrate(dt);
  return p.velocity.toArray();
}

test("update linear velocity from the acceleration", () => {
  const forceAccum = new THREE.Vector3(0, -20, 0);
  const velocity = new THREE.Vector3(0, -1, 0);
  expect(integrateVelocity(0.1, forceAccum, 0.5)).toEqual(velocity.toArray());
});

function integrateDrag(dt : number, velocity : THREE.Vector3, damping : number) {
  const p = new Particle();
  p.velocity = velocity;
  p.damping = damping;
  p.integrate(dt);
  return p.velocity.toArray();
}

test("impose drag", () => {
  const initialVelocity = new THREE.Vector3(1, 0, 0);
  const finalVelocity = new THREE.Vector3(9, 0, 0);
  expect(integrateDrag(2, initialVelocity, 3)).toEqual(finalVelocity.toArray());
});

function clearAccumulator(forceAccum : THREE.Vector3) {
  const p = new Particle();
  p.forceAccum = forceAccum;
  p.clearAccumulator();
  return p.forceAccum.toArray();
}

test("clear accumulator", () => {
  const initialForceAccum = new THREE.Vector3(0, -10, 0);
  const finalForceAccum = new THREE.Vector3();
  expect(clearAccumulator(initialForceAccum)).toEqual(
    finalForceAccum.toArray()
  );
});
