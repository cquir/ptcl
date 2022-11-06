import * as THREE from "three";
import "./index.css";
import { Particles, ParticleRef, pSize } from "ptcl";
import { OrbitControls } from "three-stdlib";
import Stats from "stats.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7d6bf);
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
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
renderer.domElement.style.width = "100vw";
renderer.domElement.style.height = "100vh";
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);

function initParticle(particle: ParticleRef) {
  particle.resetState();
  particle.setMass(2);
  particle.setVelocity(
    (Math.random() - 0.5) * 5,
    5 + (Math.random() + 0.5) * 5,
    (Math.random() - 0.5) * 5
  );
}

const maxParticles = 1000;
const particles = new Particles(maxParticles);

for (let particle of particles) {
  initParticle(particle);
}

const geometry = new THREE.SphereGeometry(0.025, 8, 8);
const material = new THREE.MeshBasicMaterial({ color: 0x318fb5 });

const iMesh = new THREE.InstancedMesh(geometry, material, maxParticles);
iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
console.log(iMesh);

const _mat4 = new THREE.Matrix4();

scene.add(iMesh);

function syncGraphics() {
  // THREE.InstancedMesh stores the transformation matrices of all the
  // instances in a single contiguous buffer property instanceMatrix
  // which is of type THREE.InstancedBufferAttribute.
  //
  // So if we have to efficiently update the location of all of our instances
  // we can actually just loop through that data structure and directly edit the
  // the data ourselves instead of looping through and running `mesh.setMatrixAt`

  // positions 12, 13, 14 in the matrix account for position
  // source: https://github.com/mrdoob/three.js/blob/6671e7c4b7544207bc4e6c7bc9fcf5fc88bbb4e6/src/math/Matrix4.js#L722
  //

  for (let i = 0; i < iMesh.instanceMatrix.count; i++) {
    _mat4.setPosition(
      particles.data[i * pSize + 0],
      particles.data[i * pSize + 1],
      particles.data[i * pSize + 2]
    );
    iMesh.setMatrixAt(i, _mat4);
  }

  // signal to three.js that the instanceMatrix should be sent to the
  // GPU upon the draw call.
  iMesh.instanceMatrix.needsUpdate = true;
}

camera.position.z = 5;

const clock = new THREE.Clock();

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  // Not using iterator here since this runs every single frame
  // and the iterator adds a lil bit of overhead.
  for (let i = 0; i < maxParticles; i++) {
    // apply gravity
    particles._addForce(i, 0, -10, 0);

    // if we fall below -10 reset the particle
    if (particles.data[i * pSize + 1] < -10) {
      initParticle(particles.get(i));
    }
  }

  particles.integrate(clock.getDelta() * 0.8);

  syncGraphics();

  renderer.render(scene, camera);
  stats.end();
}

animate();
