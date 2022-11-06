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

const geometry = new THREE.SphereGeometry(0.1, 8, 8);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
let mesh = new THREE.Mesh(geometry, material);

let meshes = [];
for (let i=0; i < maxParticles; i++){
  let m = mesh.clone();
  meshes.push(m);
  scene.add(m);
}

const particles = new Particles(maxParticles,meshes);

for (let particle of particles) {
  particle.setPosition(particle.pIndex-2,0,0);
  particle.setMass(1);
  particle.setVelocity(0, 0, 0);
  particle.addForce(0,-9.82,0);
}

camera.position.z = 10;

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  particles.integrate(clock.getDelta());
  
  renderer.render(scene, camera);
}

animate();
