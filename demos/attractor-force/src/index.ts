import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import "./index.css";
import { Particle, ParticleWorld, ParticleAttractor } from "ptcl";

let clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfefefe);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 2;
camera.position.z = 10;

//@ts-ignore
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);

let controls = new OrbitControls(camera, renderer.domElement);

const world = new ParticleWorld();

const forceNorm = 10;
const attractor = new THREE.Vector3(0, 0, 0);

const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const earthGeometry = new THREE.SphereGeometry(1);
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

for (let i = 0; i < 50; i++) {
  const p = new Particle(
    new THREE.Vector3(-2 - 3 * Math.random(), 0, 0),
    1,
    0.97
  );

  const material = new THREE.MeshBasicMaterial();
  material.color.setHex(Math.random() * 0xffffff);
  const geometry = new THREE.SphereGeometry(0.1);
  const s = new THREE.Mesh(geometry, material);

  p.mesh = s;
  scene.add(s);

  const r = p.position.clone();
  r.addScaledVector(attractor, -1);
  const speed = Math.sqrt((forceNorm * r.length()) / p.getMass());
  const direction = new THREE.Vector3(0, 0, 1);
  p.velocity.addScaledVector(direction, speed);

  world.registry.add(p, new ParticleAttractor(attractor, forceNorm));
  world.addParticle(p);
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  world.runPhysics(clock.getDelta());

  world.updateGraphics();

  renderer.render(scene, camera);
}

animate();
