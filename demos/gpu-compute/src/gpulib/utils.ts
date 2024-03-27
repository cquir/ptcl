import * as THREE from "three";
// @ts-ignore
import passVertexShaderSrc from "./shaders/passVertex.glsl";
// @ts-ignore
import passFragmentShaderSrc from "./shaders/passFragment.glsl";

/**
 *
 * @param sizeX
 * @param sizeY
 * @returns THREE.ShaderMaterial
 */
function createPassThroughMaterial(
  sizeX: number,
  sizeY: number
): THREE.ShaderMaterial {
  const passThruMat = new THREE.ShaderMaterial({
    uniforms: {
      passThruTexture: { value: null },
    },
    vertexShader: passVertexShaderSrc,
    fragmentShader: passFragmentShaderSrc,
  });

  passThruMat.defines.resolution =
    "vec2( " + sizeX.toFixed(1) + ", " + sizeY.toFixed(1) + " )";

  return passThruMat;
}

/**
 * Constructs a DataTexture consisting of RGBA values 
 * so a vec4 at each UV coordinate
 * @param sizeX
 * @param sizeY
 * @param initialValue
 * @returns THREE.DataTexture
 */
function constructTexture(
  sizeX: number,
  sizeY: number,
  initialValue?: Float32Array
): THREE.DataTexture {
  
  let data : Float32Array;
  if (initialValue !== undefined) {
    data = initialValue;
  } else {
    data = new Float32Array(4 * sizeX * sizeY);
  }

  return new THREE.DataTexture(
    data,
    sizeX,
    sizeY,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  
}

function createRenderTarget(sizeXTexture: number, sizeYTexture: number) {
  const renderTarget = new THREE.WebGLRenderTarget(sizeXTexture, sizeYTexture, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    depthBuffer: false,
  });

  // TODO: Include a step which initializes a value using a passthrough shader.

  return renderTarget;
}

export { constructTexture, createRenderTarget, createPassThroughMaterial };
