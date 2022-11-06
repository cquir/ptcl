import * as THREE from "three";
import "./index.css";
import { Particles } from "ptcl";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  //@ts-ignore
  canvas: document.getElementById("canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);

const maxParticles = 5;
const particles = new Particles(maxParticles);

const geometry = new THREE.SphereGeometry(0.25, 8, 8);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
let mesh = new THREE.Mesh(geometry, material);

let meshes: Array<THREE.Mesh> = [];
for (let particle of particles) {
  particle.setPosition(particle.pIndex * 2 - 5, 0, 0);
  particle.setMass(1);
  particle.setVelocity(Math.random() / 10, Math.random(), Math.random() / 10);
  let m = mesh.clone();
  meshes.push(m);
  scene.add(m);
}

camera.position.z = 5;

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  particles.integrate(clock.getDelta());

  // apply gravity
  for (let particle of particles) {
    particle.addForce(0,-9.82,0);
  }

  console.log(particles.getVelocity(3));

  for (let i = 0; i < maxParticles; i++) {
    const newPos = particles.getPosition(i);
    meshes[i].position.set(newPos.x, newPos.y, newPos.z);
  }

  renderer.render(scene, camera);
}

animate();
