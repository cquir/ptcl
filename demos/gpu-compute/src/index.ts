import * as THREE from "three";
import "./index.css";
import Stats from "stats.js";
import ComputeShader from "./gpulib/ComputeShader";
import { OrbitControls } from "three-stdlib";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7d6bf);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  //@ts-ignore
  canvas: document.getElementById("canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.width = "100vw";
renderer.domElement.style.height = "100vh";
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);

const numParticles = 4000;

let position = new Float32Array(numParticles * 3);
let velocity = new Float32Array(numParticles * 3);
let acceleration = new Float32Array(numParticles * 3);

for (let i = 0; i < position.length; i += 3) {
  position[i + 0] = 0;
  position[i + 1] = 0;
  position[i + 2] = 0;

  velocity[i + 0] = Math.random() -0.5;
  velocity[i + 1] = Math.random() * 5;
  velocity[i + 2] = Math.random() -0.5;

  acceleration[i + 0] = 0;
  acceleration[i + 1] = -3;
  acceleration[i + 2] = 0;
}

const computeShader = new ComputeShader(renderer, {
  numParticles,
  position,
  velocity,
  acceleration,
});

const geometry = new THREE.SphereGeometry(0.05, 8, 8);
const material = new THREE.MeshBasicMaterial({ color: 0x318fb5 });

const iMesh = new THREE.InstancedMesh(geometry, material, numParticles);
iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
scene.add(iMesh);

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
const posBuffer = new Float32Array(4 * numParticles);

const _mat4 = new THREE.Matrix4();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();

  computeShader.compute(dt);
  computeShader.readPosition(posBuffer);

  for (let i = 0; i < numParticles; i += 4) {
    _mat4.setPosition(posBuffer[i + 0], posBuffer[i + 1], posBuffer[i + 2]);
    iMesh.setMatrixAt(i, _mat4);
  }
  iMesh.instanceMatrix.needsUpdate = true;

  renderer.render(scene, camera);
  stats.end();
}

animate();
