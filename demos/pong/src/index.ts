// TODO: put the future README.md hello world here
import * as THREE from "three";
import "./index.css";
import Input from "./input";
import { player1Paddle, player2Paddle, ball } from "./objects";
import { BALL_MASS, PADDLE_SPEED, PADDLE_SIZE, HIT_SPEEDUP } from "./settings";
import Stats from "stats.js";
import { Particles, updateMeshesArray } from "ptcl";

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let elem: any = document.getElementById("canvas");
const canvas: HTMLCanvasElement = elem;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-15, 15, 15, -15, 0.1, 30);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({
  //@ts-ignore
  canvas: canvas,
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
player1Paddle.geometry.computeBoundingBox();
player2Paddle.geometry.computeBoundingBox();
ball.geometry.computeBoundingBox();

scene.add(player1Paddle);
scene.add(player2Paddle);
scene.add(ball);

ball.position.set(0, 0, 0);
player1Paddle.position.set(-14.5, 0, 0);
player2Paddle.position.set(14.5, 0, 0);

const clock = new THREE.Clock();
let dt: number;

const particles = new Particles(1);

// ball particle
const bp = particles.get(0);

bp.setMass(BALL_MASS);
bp.setDamping(1); // fully conserve momentum
bp.addForce((Math.random() > 0.5) ? -1 : 1, 0, 0);

particles.integrate(1000 / 60);

const boxA: any = new THREE.Box3();
const boxB: any = new THREE.Box3();

function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  dt = clock.getDelta();

  if (Input.GetKey("w")) {
    player1Paddle.position.y += dt * PADDLE_SPEED;
  }

  if (Input.GetKey("s")) {
    player1Paddle.position.y -= dt * PADDLE_SPEED;
  }

  if (Input.GetKey("arrowup")) {
    player2Paddle.position.y += dt * PADDLE_SPEED;
  }

  if (Input.GetKey("arrowdown")) {
    player2Paddle.position.y -= dt * PADDLE_SPEED;
  }

  if (ball.position.x > 14.5 || ball.position.x < -14.5) {
    bp.setPosition(0,0,0);
  }

  particles.integrate(dt);
  updateMeshesArray(particles, [ball]);

  boxA.setFromObject(player1Paddle);
  boxB.setFromObject(ball);
  // paddle collisions
  if (boxA.intersectsBox(boxB)) {
    let currentVel = particles._getVelocity(0);
    // make it so that you can angle the ball if you collide on the edges of the paddle
    particles._setVelocity(0, currentVel.x * -1 + HIT_SPEEDUP, ((ball.position.y - player1Paddle.position.y) / PADDLE_SIZE) * 8, 0);
  }
  boxA.setFromObject(player2Paddle);
  if (boxA.intersectsBox(boxB)) {
    let currentVel = particles._getVelocity(0);
    particles._setVelocity(0, currentVel.x * -1 + HIT_SPEEDUP, ((ball.position.y - player2Paddle.position.y) / PADDLE_SIZE) * 8, 0);
  }


  // reflection of vector on plane: https://en.wikipedia.org/wiki/Reflection_%28mathematics%29#Reflection_across_a_line_in_the_plane
  // −(2(n · v) n − v)
  // this is so scuffed but it kinda works
  if (ball.position.y > 14.5) {

    let currentVel = particles._getVelocity(0);
    let n = new THREE.Vector3(0,-1,0);
    let dot = n.dot(currentVel);
    let newVel = new THREE.Vector3().copy(n);
    newVel.multiplyScalar(-2*dot);
    newVel.sub(currentVel);
    particles._setVelocity(0, -newVel.x, newVel.y, newVel.z);
  }

  if (ball.position.y < -14.5) {

    // reflection of vector on plane: https://en.wikipedia.org/wiki/Reflection_%28mathematics%29#Reflection_across_a_line_in_the_plane
    // −(2(n · v) n − v)

    let currentVel = particles._getVelocity(0);
    let n = new THREE.Vector3(0,1,0);
    let dot = n.dot(currentVel);
    let newVel = new THREE.Vector3().copy(n);
    newVel.multiplyScalar(-2*dot);
    newVel.sub(currentVel);
    particles._setVelocity(0, -newVel.x, newVel.y, newVel.z);
  }

  renderer.render(scene, camera);

  stats.end();
}

animate();
