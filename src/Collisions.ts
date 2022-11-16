import * as THREE from "three";
import { ParticleRef } from "./Particles";
import { argmin } from "./utils";

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

function particleBoxCollisionDetection(
  particle:ParticleRef,
  particleGeometry:THREE.SphereGeometry,
  box:THREE.Mesh,
  boxGeometry:THREE.BoxGeometry){
      let relCenter = particle.getPosition();
      relCenter.addScaledVector(box.position,-1);
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
              const distanceToFace = [
                Math.abs(relCenter.x)-width/2,
                Math.abs(relCenter.y)-height/2,
                Math.abs(relCenter.z)-depth/2,
              ]
              const idx = argmin(distanceToFace.map(x => Math.abs(x)));
              const val = relCenter.getComponent(idx) > 0 ? 1 : -1;
              normal.setComponent(idx,val);
              normal.applyQuaternion(box.quaternion);
              penetration = radius - distanceToFace[idx];
      }
      let values : [boolean,THREE.Vector3,number] = [collided,normal,penetration];
      return values;
}

// Assuming collision with immovable object.
function collisionResponse(
  particle: ParticleRef,
  normal: THREE.Vector3,
  penetration: number,
  withBox: boolean,
  Cr = 0
) {
  particle.addPosition(
    penetration * normal.x,
    penetration * normal.y,
    penetration * normal.z
  );
  const sign = withBox? -1 : 1;
  const norm = sign*(1 + Cr) * particle.getVelocity().dot(normal);
  particle.addVelocity(norm * normal.x, norm * normal.y, norm * normal.z);
}

export { particleSphereCollisionDetection, particleBoxCollisionDetection, collisionResponse };
