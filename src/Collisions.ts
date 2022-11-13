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

// Assuming collision with immovable object.
function collisionResponse(
  particle: ParticleRef,
  normal: THREE.Vector3,
  penetration: number,
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

export { particleSphereCollisionDetection, collisionResponse };
