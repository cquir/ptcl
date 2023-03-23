import * as THREE from "three";
import "./index.css";
import { OrbitControls } from "three-stdlib";
import {
  Particles,
  ParticleRef,
  pSize,
  updateInstancedMesh,
  collisionResponse,
} from "ptcl";

function particleBoxCollisionDetection(
  particle:ParticleRef,
  particleGeometry:THREE.SphereGeometry,
  box:THREE.Mesh,
  boxGeometry:THREE.BoxGeometry){
      let relCenter = particle.getPosition().addScaledVector(box.position,-1);
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
      const [width,height,depth] = [
          boxGeometry.parameters.width,
          boxGeometry.parameters.height,
          boxGeometry.parameters.depth
      ];
      if ((Math.abs(relCenter.x) <= radius + width/2) &&
          (Math.abs(relCenter.y) <= radius + height/2) &&
          (Math.abs(relCenter.z) <= radius + depth/2)){
              collided = true;
              let closestPoint =  relCenter.clone();
              closestPoint.x = (closestPoint.x > width/2)? width/2: closestPoint.x;
              closestPoint.x = (closestPoint.x < -width/2)? -width/2: closestPoint.x;
              closestPoint.y = (closestPoint.y > height/2)? height/2: closestPoint.y;
              closestPoint.y = (closestPoint.y < -height/2)? -height/2: closestPoint.y;
              closestPoint.z = (closestPoint.z > depth/2)? depth/2: closestPoint.z;
              closestPoint.z = (closestPoint.z < -depth/2)? -depth/2: closestPoint.z;
              closestPoint.applyQuaternion(box.quaternion).add(box.position);
              normal = particle.getPosition().addScaledVector(closestPoint,-1);
              let norm = normal.length();
              normal.multiplyScalar(1/norm);
              penetration = radius-norm;
      }
      let values : [boolean,THREE.Vector3,number] = [collided,normal,penetration];
      return values;
}

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
  /*particle.setVelocity(
    Math.random() - 0.5,
    Math.random() + 0.5,
    Math.random() - 0.5
  );*/
}

const maxParticles = 1;
const particles = new Particles(maxParticles);

for (let particle of particles) {
  initParticle(particle);
}

const geometry = new THREE.SphereGeometry(0.05, 8, 8);
const material = new THREE.MeshBasicMaterial({ color: "white" });

const iMesh = new THREE.InstancedMesh(geometry, material, maxParticles);
iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(iMesh);

const colliderGeometry = new THREE.BoxGeometry(1,1,1,3,3,3);
const colliderMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
const collider = new THREE.Mesh(colliderGeometry,colliderMaterial);
collider.position.set(0,-1,0);
//collider.rotateZ(Math.PI/4);
scene.add(collider);

camera.position.z = 3;

const clock = new THREE.Clock();

let help = true;

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Not using iterator here since this runs every single frame
  // and the iterator adds a lil bit of overhead.
  for (let i = 0; i < maxParticles; i++) {
    // apply gravity
    particles._addForce(i, 0, -1, 0);

    const particle = particles.get(i);
    const [collided, normal, penetration] = particleBoxCollisionDetection(
      particle,
      geometry,
      collider,
      colliderGeometry
    );
    if (collided) {
      collisionResponse(particle,normal,penetration);
    }

    if (isNaN(particles.data[i * pSize + 1])){
      // *** PROBLEM: When particle is inside box, closestPoint == particle.getPosition() ***
      
      console.log('y position is NaN',normal)
      initParticle(particle)
    }

    // if we fall below -10 reset the particle
    if (particles.data[i * pSize + 1] < -10) {
      initParticle(particle)
    }
  }

  particles.integrate(clock.getDelta());

  updateInstancedMesh(particles, iMesh);

  renderer.render(scene, camera);
}

animate();