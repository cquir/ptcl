import * as THREE from "three";
import "./index.css";
import { OrbitControls } from "three-stdlib";
import {
  Particles,
  ParticleRef,
  pSize,
  updateInstancedMesh,
} from "ptcl";


// **************************************************************

function particlePlaneCollisionDetection(
  particle: ParticleRef,
  particleGeometry: THREE.SphereGeometry,
  plane: THREE.Mesh,
) {
  const normal = new THREE.Vector3(0, 0, 1);
  normal.applyQuaternion(plane.quaternion);
  const offset = -normal.dot(plane.position);
  const radius = particleGeometry.parameters.radius;
  const distance = normal.dot(particle.getPosition()) + offset;
  let collided = false;
  let penetration = 0;
  if ((distance < 0) || (distance >= 0 && distance < radius)) {
    collided = true;
    penetration = radius - distance;
  }
  let values: [boolean, THREE.Vector3, number] = [
    collided,
    normal,
    penetration,
  ];
  return values;
}

function collisionResponse(
  particles: Particles,
  pIndex: number,
  normal: THREE.Vector3,
  penetration: number,
  dt: number,
  Cr = 0.5,
) {
  particles._addPosition(
    pIndex,
    penetration * normal.x,
    penetration * normal.y,
    penetration * normal.z
  );
  let norm = Math.abs((1 + Cr) * particles._getVelocity(pIndex).dot(normal));
  particles._addVelocity(pIndex, norm * normal.x, norm * normal.y, norm * normal.z);
}

// **************************************************************

const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 0.5;
camera.position.z = 3;

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
  particle.setPosition(0, 2, 0);
  particle.setVelocity(
    Math.random() - 0.5,
    0,
    Math.random() - 0.5,
  )
}
const maxParticles = 1000;
const particles = new Particles(maxParticles);
const geometry = new THREE.SphereGeometry(0.025, 8, 8);
for (let particle of particles) {
  initParticle(particle);
}
const material = new THREE.MeshBasicMaterial({ color: "white" });
const iMesh = new THREE.InstancedMesh(geometry, material, maxParticles);
scene.add(iMesh);

const planeGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-Math.PI / 2);
//plane.rotateY(-Math.PI/8);
scene.add(plane);

const clock = new THREE.Clock();

let print = true;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  const dt = clock.getDelta();
  for (let i = 0; i < maxParticles; i++) {
    particles._addForce(i, 0, -1 * 2, 0);
    const particle = particles.get(i);
    const [collided, normal, penetration] = particlePlaneCollisionDetection(
      particle,
      geometry,
      plane
    );

    if (collided) {
      collisionResponse(particles, i, normal, penetration, dt, 1);
    }
    if (particles.data[i * pSize + 1] < -10) {
      initParticle(particle);
    }
  }
  particles.integrate(dt);
  updateInstancedMesh(particles, iMesh);
  renderer.render(scene, camera);
}

animate();