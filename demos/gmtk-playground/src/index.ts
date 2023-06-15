import * as THREE from "three";
import "./index.css";
import {
  Particles,
  ParticleRef,
  pSize,
  updateInstancedMesh,
} from "ptcl";

// *****************************************************

function argmin(vec: Array<number>) {
  return vec.map((a, i) => [a, i]).sort((a, b) => a[0] - b[0]).map(a => a[1])[0]
}

function particleBoxCollisionDetection(
  particle: ParticleRef,
  particleGeometry: THREE.SphereGeometry,
  box: THREE.Mesh,
  boxGeometry: THREE.BoxGeometry) {
  let relCenter = particle.getPosition().addScaledVector(box.position, -1);
  const quaternion = new THREE.Quaternion(
    -box.quaternion.x,
    -box.quaternion.y,
    -box.quaternion.z,
    box.quaternion.w
  );
  relCenter.applyQuaternion(quaternion);
  let collided = false;
  let normal = new THREE.Vector3();
  let penetration = 0;
  const radius = particleGeometry.parameters.radius;
  const [width, height, depth] = [
    boxGeometry.parameters.width,
    boxGeometry.parameters.height,
    boxGeometry.parameters.depth
  ];
  if ((Math.abs(relCenter.x) <= radius + width / 2) &&
    (Math.abs(relCenter.y) <= radius + height / 2) &&
    (Math.abs(relCenter.z) <= radius + depth / 2)) {
    const vec = [
      Math.abs(width / 2 - relCenter.x),
      Math.abs(-width / 2 - relCenter.x),
      Math.abs(height / 2 - relCenter.y),
      Math.abs(-height / 2 - relCenter.y),
      Math.abs(depth / 2 - relCenter.z),
      Math.abs(-depth / 2 - relCenter.z),
    ]
    const idx = argmin(vec);
    if (idx == 2) {
      collided = true;
      normal.x = idx < 2 ? 1 : 0;
      normal.y = (idx >= 2 && idx < 4) ? 1 : 0;
      normal.z = (idx >= 4 && idx < 6) ? 1 : 0;
      const sign = (idx % 2 == 0) ? 1 : -1;
      normal.multiplyScalar(sign);
      normal.applyQuaternion(box.quaternion);

      if ((Math.abs(relCenter.x) <= width / 2) &&
        (Math.abs(relCenter.y) <= height / 2) &&
        (Math.abs(relCenter.z) <= depth / 2)) {
        penetration = radius + vec[idx];
      } else {
        penetration = radius - vec[idx];
      }
    }
  }
  let values: [boolean, THREE.Vector3, number] = [collided, normal, penetration];
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

// *****************************************************

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

function initParticle(particle: ParticleRef) {
  particle.resetState();
  particle.setMass(2);
  particle.setPosition(0, 1, 0);
  particle.setVelocity(
    0.1 * (Math.random() - 0.5),
    0,
    0.1 * (Math.random() - 0.5)
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


const colliderGeometry = new THREE.BoxGeometry(2, 1, 2, 3, 1, 3);
const colliderMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: "red" });
colliderMaterial.opacity = 0;
colliderMaterial.transparent = false;
const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
collider.rotateZ(Math.PI / 8)
collider.position.set(0, -1, 0)
scene.add(collider)

camera.position.z = 5;

function handleDeviceOrientation(event) {
  // Get the rotation values from the event
  const { alpha, beta, gamma } = event;

  // Convert degrees to radians
  const alphaRad = THREE.MathUtils.degToRad(alpha);
  const betaRad = THREE.MathUtils.degToRad(beta);
  const gammaRad = THREE.MathUtils.degToRad(gamma);

  // Set the cube rotation based on the device orientation
  collider.rotation.set(betaRad, alphaRad, -gammaRad);
}

function checkSupportFor(name, propertyName, propertyOwner = window) {
  if (!(propertyName in propertyOwner)) {
    console.warn(`No support for ${name}`);
  } else {
    console.log(`Supports ${name}!`);
    return true;
  }
}

// if (checkSupportFor("Device Motion", "ondevicemotion")) {
//   console.log("add devicemotion handler");
//   window.addEventListener("devicemotion", handleDeviceMotion);
// }

if (checkSupportFor("Device Orientation", "ondeviceorientation")) {
  console.log("add deviceorientation handler");
  window.addEventListener("deviceorientation", handleDeviceOrientation);
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();

  for (let i = 0; i < maxParticles; i++) {
    particles._addForce(i, 0, -10, 0);
    const particle = particles.get(i);
    let [collided, normal, penetration] = particleBoxCollisionDetection(
      particle,
      geometry,
      collider,
      colliderGeometry
    );

    if (collided) {
      collisionResponse(particles, i, normal, penetration, dt, 0.0)
    }

    if (particles.data[i * pSize + 1] < -10) {
      initParticle(particle)
    }
  }

  particles.integrate(dt);

  updateInstancedMesh(particles, iMesh);

  renderer.render(scene, camera);
}

animate();
