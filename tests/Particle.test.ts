import * as THREE from "three";
import {Particle} from "../src";

function addForce(force) {
  const p = new Particle();
  p.addForce(force);
  return p.forceAccum.toArray();
}

test("add force", () => {
  const force = new THREE.Vector3(0, -20, 0);
  expect(addForce(force)).toEqual(force.toArray());
});

function setMass(mass) {
  const p = new Particle();
  p.setMass(mass);
  return p.inverseMass;
}

test("calculate inverse mass", () => {
  expect(setMass(2)).toBe(0.5);
});

function getMass(inverseMass) {
  const p = new Particle();
  p.inverseMass = inverseMass;
  return p.getMass();
}

test("retrieve mass", () => {
  expect(getMass(0.5)).toBe(2);
});

test("retrieve mass (Infinity case)", () => {
  expect(getMass(0)).toBe(Infinity);
});

function hasFiniteMass(inverseMass) {
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

function integratePosition(dt, velocity) {
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

function integrateAcceleration(dt, forceAccum, inverseMass) {
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

function integrateVelocity(dt, forceAccum, inverseMass) {
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

function integrateDrag(dt, velocity, damping) {
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

function clearAccumulator(forceAccum) {
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
