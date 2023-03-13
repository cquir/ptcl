import * as THREE from "three";
import { Particles, pSize } from "./Particles";

// TODO: figure out how we want to sync/update graphics with new data structure

function updateMeshesArray(particles: Particles, meshes: Array<THREE.Mesh>) {
  for (let i = 0; i < particles.maxParticles; i++) {
    meshes[i].position.x = particles.data[i * pSize];
    meshes[i].position.y = particles.data[i * pSize + 1];
    meshes[i].position.z = particles.data[i * pSize + 2];
  }
}

function updateInstancedMesh(data: Float32Array, iMesh: THREE.InstancedMesh) {
  // THREE.InstancedMesh stores the transformation matrices of all the
  // instances in a single contiguous buffer property instanceMatrix
  // which is of type THREE.InstancedBufferAttribute.
  //
  // So if we have to efficiently update the location of all of our instances
  // we can actually just loop through that data structure and directly edit the
  // the data ourselves instead of looping through and running `mesh.setMatrixAt`

  // positions 12, 13, 14 in the matrix account for position
  // source: https://github.com/mrdoob/three.js/blob/6671e7c4b7544207bc4e6c7bc9fcf5fc88bbb4e6/src/math/Matrix4.js#L722
  //

  const _mat4 = new THREE.Matrix4();

  for (let i = 0; i < iMesh.instanceMatrix.count; i++) {
    _mat4.setPosition(
      data[i * pSize + 0],
      data[i * pSize + 1],
      data[i * pSize + 2]
    );
    iMesh.setMatrixAt(i, _mat4);
  }

  // signal to three.js that the instanceMatrix should be sent to the
  // GPU upon the draw call.
  iMesh.instanceMatrix.needsUpdate = true;
}

export { updateMeshesArray, updateInstancedMesh };
