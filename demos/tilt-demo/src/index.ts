// TODO: put the future README.md hello world here
import * as THREE from "three";
import "./index.css";

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

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function handleDeviceOrientation(event) {
  // Get the rotation values from the event
  const { alpha, beta, gamma } = event;

  // Convert degrees to radians
  const alphaRad = THREE.MathUtils.degToRad(alpha);
  const betaRad = THREE.MathUtils.degToRad(beta);
  const gammaRad = THREE.MathUtils.degToRad(gamma);

  // Set the cube rotation based on the device orientation
  cube.rotation.set(betaRad, alphaRad, -gammaRad);
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

function animate() {
  requestAnimationFrame(animate);

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
