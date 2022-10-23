import * as THREE from "three";
import Particle from '../src/physics/Particle';

function getMass(mass){
	const position = new THREE.Vector3();
	const p = new Particle(position,mass);
	return p.getMass();
}

export default getMass;
