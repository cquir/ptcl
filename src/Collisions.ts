import * as THREE from "three";
import { ParticleRef } from "./Particles";

function particleSphereCollisionDetection(
  particle: ParticleRef,
  particleGeometry: THREE.SphereGeometry,
  sphere: THREE.Mesh,
  sphereGeometry: THREE.SphereGeometry
) {
  let midline = particle.getPosition();
  midline.addScaledVector(sphere.position, -1);
  const norm = midline.length();
  let collided = false;
  let normal = new THREE.Vector3();
  let penetration = 0;
  const radiiSum =
    particleGeometry.parameters.radius + sphereGeometry.parameters.radius;
  if (norm <= radiiSum) {
    collided = true;
    normal = midline.clone().multiplyScalar(1 / norm);
    penetration = radiiSum - norm;
  }
  let values: [boolean, THREE.Vector3, number] = [
    collided,
    normal,
    penetration,
  ];
  return values;
}

function particlePlaneCollisionDetection(
  particle: ParticleRef,
  particleGeometry: THREE.SphereGeometry,
  plane: THREE.Mesh,
  ){
    const normal = new THREE.Vector3(0,0,1);
    normal.applyQuaternion(plane.quaternion);
    const offset = -normal.dot(plane.position);
    const radius = particleGeometry.parameters.radius;
    const distance = normal.dot(particle.getPosition())+offset;
    let collided = false;
    let penetration = 0;
    if ((distance < 0) || (distance >= 0 && distance < radius)) {
      collided = true;
      penetration = radius-distance;
    }
    let values: [boolean, THREE.Vector3,number] = [
      collided,
      normal,
      penetration,
    ];
    return values;
}

function collisionResponse(
  particle: ParticleRef,
  normal: THREE.Vector3,
  penetration: number,
  dt: number,
  Cr = 0
) {
  particle.addPosition(
    penetration * normal.x,
    penetration * normal.y,
    penetration * normal.z
  );
  let norm = (1 + Cr) * particle.getVelocity().dot(normal);
  particle.addVelocity(norm * normal.x, norm * normal.y, norm * normal.z);
}

export { particleSphereCollisionDetection, particlePlaneCollisionDetection, collisionResponse };
