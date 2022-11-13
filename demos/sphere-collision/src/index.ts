import * as THREE from "three";
import "./index.css";
import { OrbitControls } from "three-stdlib";
import {
  Particles,
  ParticleRef,
  pSize,
  updateInstancedMesh,
  particleSphereCollisionDetection,
  collisionResponse,
} from "ptcl";

const scene = new THREE.Scene();
scene.background = new THREE.Color("black");
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
renderer.setPixelRatio(window.devicePixelRatio);

let controls = new OrbitControls(camera, renderer.domElement);

function initParticle(particle: ParticleRef) {
  particle.resetState();
  particle.setMass(2);
  particle.setPosition(0, 1, 0);
  particle.setVelocity(
    Math.random() - 0.5,
    Math.random() + 0.5,
    Math.random() - 0.5
  );
}

const maxParticles = 1000;
const particles = new Particles(maxParticles);

for (let particle of particles) {
  initParticle(particle);
}

const geometry = new THREE.SphereGeometry(0.025, 8, 8);
const material = new THREE.MeshBasicMaterial({ color: "white" });

const iMesh = new THREE.InstancedMesh(geometry, material, maxParticles);
iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(iMesh);

const colliderGeometry = new THREE.SphereGeometry(1.0, 16, 16);
const colliderMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
collider.position.set(0, -1, 0);
scene.add(collider);

camera.position.z = 3;

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Not using iterator here since this runs every single frame
  // and the iterator adds a lil bit of overhead.
  for (let i = 0; i < maxParticles; i++) {
    // apply gravity
    particles._addForce(i, 0, -10, 0);

    const particle = particles.get(i);
    const [collided, normal, penetration] = particleSphereCollisionDetection(
      particle,
      geometry,
      collider,
      colliderGeometry
    );
    if (collided) {
      collisionResponse(particle, normal, penetration);
    }

    // if we fall below -10 reset the particle
    if (particles.data[i * pSize + 1] < -10) {
      initParticle(particles.get(i));
    }
  }

  particles.integrate(clock.getDelta());

  updateInstancedMesh(particles, iMesh);

  renderer.render(scene, camera);
}

animate();
