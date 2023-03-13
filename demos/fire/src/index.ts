// original source/reference: https://github.com/yomotsu/three-particle-fire

import * as THREE from "three";
import "./index.css";
// @ts-ignore
import fragmentShader from "./shaders/fragment.glsl";
// @ts-ignore
import vertexShader from "./shaders/vertex.glsl";
// @ts-ignore
import textureSrc from "./shaders/texture.png";
import { OrbitControls } from "three-stdlib";

import { Particles, ParticleRef, pSize, updateInstancedMesh } from "ptcl";

const SPRITE_ROW_LENGTH = 4;
const ONE_SPRITE_ROW_LENGTH = 1 / SPRITE_ROW_LENGTH;

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

const controls = new OrbitControls(camera, renderer.domElement);

const particleCount = 100;
const geometry = new THREE.BufferGeometry();

const fireRadius = 0.5;
const fireHeight = 3;
const halfHeight = fireHeight * 0.5;
const position = new Float32Array(particleCount * 3);
const random = new Float32Array(particleCount);
const sprite = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const r = Math.sqrt(Math.random()) * fireRadius;
  const angle = Math.random() * 2 * Math.PI;
  position[i * 3 + 0] = Math.cos(angle) * r;
  position[i * 3 + 1] =
    ((fireRadius - r) / fireRadius) * halfHeight + halfHeight;
  position[i * 3 + 2] = Math.sin(angle) * r;
  sprite[i] = ONE_SPRITE_ROW_LENGTH * ((Math.random() * 4) | 0);
  random[i] = Math.random();

  if (i === 0) {
    // to avoid going out of Frustum
    position[i * 3 + 0] = 0;
    position[i * 3 + 1] = 0;
    position[i * 3 + 2] = 0;
  }
}

geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
geometry.setAttribute("random", new THREE.BufferAttribute(random, 1));
geometry.setAttribute("sprite", new THREE.BufferAttribute(sprite, 1));

const texture = new THREE.TextureLoader().load(textureSrc);

const material = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0xff2200) },
    size: { value: 0.4 },
    map: { value: texture },
    time: { value: 0.0 },
    heightOfNearPlane: { value: 0.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  blending: THREE.AdditiveBlending,
  depthTest: true,
  depthWrite: false,
  transparent: true,
});
material.uniforms.heightOfNearPlane.value = Math.abs(
  window.innerHeight /
    (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)))
);

console.log(geometry)
const particleFire = new THREE.Points(geometry, material);
scene.add(particleFire);

camera.position.z = 5;

const clock = new THREE.Clock();

const instanceGeo = new THREE.SphereGeometry(0.025, 24, 24);
const instanceMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const iMesh = new THREE.InstancedMesh(instanceGeo, instanceMat, particleCount);
iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
// scene.add(iMesh);

function animate() {
  requestAnimationFrame(animate);

  const dt: number = clock.getDelta();
  material.uniforms.time.value = (material.uniforms.time.value + dt / 5) % 1;

  const _mat4 = new THREE.Matrix4();

  for (let i = 0; i < iMesh.instanceMatrix.count; i++) {
    _mat4.setPosition(
      position[i * 3 + 0],
      position[i * 3 + 1],
      position[i * 3 + 2]
    );
    iMesh.setMatrixAt(i, _mat4);
  }

  // signal to three.js that the instanceMatrix should be sent to the
  // GPU upon the draw call.
  iMesh.instanceMatrix.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();
