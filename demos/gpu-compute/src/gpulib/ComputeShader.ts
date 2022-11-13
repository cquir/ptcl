/**
 * Reference code: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/misc/GPUComputationRenderer.js

 * This is being implemented specifically for the integration problem we are
   trying to solve but we can use it as reference for a more general soln l8r

 */
import * as THREE from "three";

// @ts-ignore
import frag1Src from "./shaders/frag-1-update-pos.glsl";
// @ts-ignore
import passVertexShaderSrc from "./shaders/passVertex.glsl";

import {
  createPassThroughMaterial,
  createRenderTarget,
  constructTexture,
} from "./utils";

interface ComputeShaderOptions {
  numParticles: number;
  position: Float32Array;
  velocity: Float32Array;
  acceleration: Float32Array;
}

class ComputeShader {
  numParticles: number;

  computeTexture: THREE.DataTexture;

  renderer: THREE.WebGLRenderer;
  renderTarget: THREE.WebGLRenderTarget;

  _scene: THREE.Scene;
  _camera: THREE.Camera;
  _mesh: THREE.Mesh;

  _passThruMat: THREE.ShaderMaterial;
  _frag1: THREE.ShaderMaterial;

  hasRendered: boolean;

  constructor(renderer: THREE.WebGLRenderer, options: ComputeShaderOptions) {
    this.numParticles = options.numParticles;
    this.renderer = renderer;

    this.computeTexture = this.initComputeTexture(
      options.position,
      options.velocity,
      options.acceleration
    );
    this.computeTexture.needsUpdate = true;
    this.renderTarget = createRenderTarget(this.numParticles, 3);

    this._scene = new THREE.Scene();
    this._camera = new THREE.Camera();
    this._camera.position.z = 1;

    this.hasRendered = false;

    // update pos
    this._frag1 = new THREE.ShaderMaterial({
      uniforms: {
        computeTexture: { value: this.computeTexture },
        dt: { value: 0.01 },
      },
      vertexShader: passVertexShaderSrc,
      fragmentShader: frag1Src,
    });
    this._frag1.defines.resolution =
      "vec2( " + this.numParticles.toFixed(1) + ", " + (3).toFixed(1) + " )";

    this._passThruMat = createPassThroughMaterial(this.numParticles, 1);

    this._mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this._passThruMat
    );
    this._scene.add(this._mesh);
  }

  initComputeTexture(
    position: Float32Array,
    velocity: Float32Array,
    acceleration: Float32Array
    // inverseMass: Float32Array
  ): THREE.DataTexture {
    const buffer = new Float32Array(4 * this.numParticles * 3);

    // Our texture buffer consists of rgba values but our positions consist
    // of x,y,z pairings so we need to copy the data accounting for the difference

    // being lazy with index math and using variable instead lol,
    // should revisit this when brain is working better
    let bufferIndex = 0;
    for (let i = 0; i < position.length; i += 3) {
      buffer[bufferIndex + 0] = position[i + 0];
      buffer[bufferIndex + 1] = position[i + 1];
      buffer[bufferIndex + 2] = position[i + 2];

      bufferIndex += 4;
    }

    for (let i = 0; i < velocity.length; i += 3) {
      buffer[bufferIndex + 0] = velocity[i + 0];
      buffer[bufferIndex + 1] = velocity[i + 1];
      buffer[bufferIndex + 2] = velocity[i + 2];

      bufferIndex += 4;
    }

    for (let i = 0; i < acceleration.length; i += 3) {
      buffer[bufferIndex + 0] = acceleration[i + 0];
      buffer[bufferIndex + 1] = acceleration[i + 1];
      buffer[bufferIndex + 2] = acceleration[i + 2];

      // // using the alpha slot on acceleration to store inverseMass
      // buffer[bufferIndex + 3] = inverseMass[inverseMassIndex];

      bufferIndex += 4;
    }

    return constructTexture(this.numParticles, 3, buffer);
  }

  // CAUTION this transfer data from the graphics device to CPU
  // and can easily become a bottleneck
  read(buffer?: Float32Array) {
    if (buffer === undefined) {
      buffer = new Float32Array(4 * this.numParticles * 3);
    }

    this.renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      this.numParticles,
      3,
      buffer
    );

    return buffer;
  }

  compute(dt: number): void {
    // Save the current renderer's settings so we can restore them before exiting
    const currentRenderTarget = this.renderer.getRenderTarget();
    const currentXrEnabled = this.renderer.xr.enabled;
    const currentShadowAutoUpdate = this.renderer.shadowMap.autoUpdate;
    const currentOutputEncoding = this.renderer.outputEncoding;
    const currentToneMapping = this.renderer.toneMapping;

    // temporarily edit the renderer for our compute purposes
    this.renderer.xr.enabled = false; // Avoid camera modification
    this.renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
    this.renderer.outputEncoding = THREE.LinearEncoding;
    this.renderer.toneMapping = THREE.NoToneMapping;

    // COMPUTATION START

    this._frag1.uniforms.dt.value = dt;

    // if (this.hasRendered) {
    //   this._frag1.uniforms.computeTexture.value = this.computeTexture;
    //   this._frag1.uniforms.computeTexture.value.needsUpdate = true;
    // }

    this._frag1.uniformsNeedUpdate = true;

    this._mesh.material = this._frag1;
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this._scene, this._camera);

    // COMPUTATION END

    // restore renderer state
    this.renderer.xr.enabled = currentXrEnabled;
    this.renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    this.renderer.outputEncoding = currentOutputEncoding;
    this.renderer.toneMapping = currentToneMapping;

    this.renderer.setRenderTarget(currentRenderTarget);

    // NEED TO FIND A BETTER WAY TO FEED THE OUTPUT OF THE SHADER BACK TO ITSELF
    // SINCE THIS SEEMS TO LOAD EVERYTHING BACK TO CPU EVERYFRAME EVEN IF NOT NEEDED
    // this.computeTexture = new THREE.DataTexture(
    //   this.read(),
    //   this.numParticles,
    //   3,
    //   THREE.RGBAFormat,
    //   THREE.FloatType
    // );

    this.read(this.computeTexture.source.data.data);
    this.computeTexture.needsUpdate = true;

    this.hasRendered = true;
  }

  setVelocity(x: number, y: number, z: number, i: number) {
    let bufferIndex = this.numParticles * 4 + i * 4;

    this.computeTexture.source.data.data[bufferIndex] = x;
    this.computeTexture.source.data.data[bufferIndex + 1] = y;
    this.computeTexture.source.data.data[bufferIndex + 2] = z;
    this.computeTexture.needsUpdate = true;
  }

  setPosition(x: number, y: number, z: number, i: number) {
    let bufferIndex = i * 4;

    this.computeTexture.source.data.data[bufferIndex] = x;
    this.computeTexture.source.data.data[bufferIndex + 1] = y;
    this.computeTexture.source.data.data[bufferIndex + 2] = z;
    this.computeTexture.needsUpdate = true;
  }

  readPosition(buffer: Float32Array): void {
    this.renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      this.numParticles,
      1,
      buffer
    );
  }
}

export default ComputeShader;
