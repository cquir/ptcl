import * as THREE from "three";
import "./index.css";
import { OrbitControls } from "three-stdlib";
import {
  Particles,
  ParticleRef,
  pSize,
  updateInstancedMesh,
} from "ptcl";

// *****************************************************

function argmin(vec:Array<number>){
  return vec.map((a,i) => [a,i]).sort((a,b) => a[0]-b[0]).map(a => a[1])[0]
}

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
              const vec = [
                Math.abs(width/2-relCenter.x),
                Math.abs(-width/2-relCenter.x),
                Math.abs(height/2-relCenter.y),
                Math.abs(-height/2-relCenter.y),
                Math.abs(depth/2-relCenter.z),
                Math.abs(-depth/2-relCenter.z),
              ]
              const idx = argmin(vec);
              
              normal.x = idx < 2? 1: 0;
              normal.y = (idx >= 2 && idx < 4)? 1: 0;
              normal.z = (idx >= 4 && idx < 6)? 1: 0;
              const sign = (idx % 2 == 0)? 1: -1;
              normal.multiplyScalar(sign);
              normal.applyQuaternion(box.quaternion);

              if ((Math.abs(relCenter.x) <= width/2) &&
                  (Math.abs(relCenter.y) <= height/2) &&
                  (Math.abs(relCenter.z) <= depth/2)){
                    penetration = radius+vec[idx];
              } else {
                    penetration = radius-vec[idx];
              }
      }
      let values : [boolean,THREE.Vector3,number] = [collided,normal,penetration];
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
  particles._addVelocity(pIndex,norm * normal.x, norm * normal.y, norm * normal.z);
}

// *****************************************************

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
  /*
  particle.setVelocity(
    0.1*(Math.random() - 0.5),
    0,
    0.1*(Math.random() - 0.5)
  );
  */
}

const maxParticles = 1;
const particles = new Particles(maxParticles);

for (let particle of particles) {
  initParticle(particle);
}

const geometry = new THREE.SphereGeometry(0.025, 8, 8);
const material = new THREE.MeshBasicMaterial({ color: "white" });

const iMesh = new THREE.InstancedMesh(geometry, material, maxParticles);
iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(iMesh);

const colliderGeometry = new THREE.BoxGeometry(1,1,1,3,3,3);
const colliderMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
const collider = new THREE.Mesh(colliderGeometry,colliderMaterial);
collider.position.set(0,-1,0);
//collider.rotateZ(Math.PI/8)
scene.add(collider);

camera.position.z = 3;

const clock = new THREE.Clock();

let print = true;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  const dt = clock.getDelta();
  for (let i = 0; i < maxParticles; i++) {
    particles._addForce(i, 0, -1, 0);
    const particle = particles.get(i);
    let [collided, normal, penetration] = particleBoxCollisionDetection(
      particle,
      geometry,
      collider,
      colliderGeometry
    );

    if (print && collided){
      console.log(particle.getVelocity().y);
      console.log(particles.data[4]);
      print = false;
    }

    if (collided) {
      collisionResponse(particles,i,normal,penetration,dt,0.0)
    }

    /*
    if (particles.data[i * pSize + 1] < -10) {
      initParticle(particle)
    }
    */
  }
  particles.integrate(dt);
  
  updateInstancedMesh(particles, iMesh);
  renderer.render(scene, camera);
}

animate();