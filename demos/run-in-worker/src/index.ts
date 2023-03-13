// TODO: put the future README.md hello world here
import * as THREE from "three";
import "./index.css";
import { MAX_PARTICLES } from "./settings";
import { pSize, updateInstancedMesh } from "ptcl";
import { OrbitControls } from "three-stdlib";
import Stats from "stats.js";

//@ts-ignore
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const sab = new SharedArrayBuffer(MAX_PARTICLES * pSize * 4);
const data = new Float32Array(sab);

const worker = new Worker("/worker.js");
worker.postMessage(sab);

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
renderer.setSize(window.innerWidth, window.innerHeight);

new OrbitControls(camera, renderer.domElement);

const geometry = new THREE.SphereGeometry(0.025, 8, 8);
const material = new THREE.MeshStandardMaterial({ color: 0x318fb5 });

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.z = 10;
dirLight.position.y = 10;
scene.add(dirLight);
const iMesh = new THREE.InstancedMesh(geometry, material, MAX_PARTICLES);
iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(iMesh);

const colliderGeometry = new THREE.SphereGeometry(1.0, 16, 16);
const colliderMaterial = new THREE.MeshStandardMaterial({
  color: 0x8B4513,
});
const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
collider.position.set(0, -1, 0);
scene.add(collider);

camera.position.z = 3;

function animate() {
  stats.begin();
  requestAnimationFrame(animate);

  updateInstancedMesh(data, iMesh);

  renderer.render(scene, camera);

  stats.end();
}

animate();
