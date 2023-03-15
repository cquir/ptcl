import * as THREE from "three";
import {PADDLE_SIZE} from "./settings";

const geometry = new THREE.BoxGeometry(1, PADDLE_SIZE, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const player1Paddle = new THREE.Mesh(geometry, material);
const player2Paddle = new THREE.Mesh(geometry, material);

const _geometry = new THREE.BoxGeometry(1, 1, 1);
const ball = new THREE.Mesh(_geometry, material);

export {
  player1Paddle,
  player2Paddle,
  ball
};
