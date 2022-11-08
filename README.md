# Particles 

A lightweight physics engine for powering particle systems in threejs.  

## Quick start

```bash
npm install ptcl
```

## Example

This code creates an animation of a particle being thrown up in the air and falling back down due to gravity.

```ts
import * as THREE from 'three';
import { Particles, updateMeshesArray } from 'ptcl';
    
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
        
const scene = new THREE.Scene();
    
const clock = new THREE.Clock();

const maxParticles = 5;

const material = new THREE.MeshBasicMaterial();
const geometry = new THREE.SphereGeometry(0.1);
const mesh = new THREE.Mesh(geometry, material);

let meshes = [];
for (let i=0; i < maxParticles; i++){
	const m = mesh.clone();
	meshes.push(m);
	scene.add(m);
}

const particles = new Particles(maxParticles); 
particles._addGlobalConstantForce(0,-10,0);

for (let particle of particles){
	particle.setPosition(particle.pIndex-2,0,0);
	particle.setMass(1);
	particle.setVelocity(0,10,0);
}

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("game")});
renderer.setSize( window.innerWidth, window.innerHeight );

function animate() {
	requestAnimationFrame(animate);

	particles.integrate(clock.getDelta());
	updateMeshesArray(particles,meshes);

	renderer.render(scene, camera);
}
animate();
```
This should be what you get:

<img src="demos/README.gif" width=50%>

## Running tests

```bash
npm run tests
```
