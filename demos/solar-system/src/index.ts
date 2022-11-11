import * as THREE from "three";
import "./index.css";
import { OrbitControls } from "three-stdlib";
import { Particles, addParticleAttractor, updateMeshesArray } from "ptcl"; 

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.y = 7;
camera.position.z = 7;

const scene = new THREE.Scene();
scene.background = new THREE.Color("rgb(28,43,77)");

let clock = new THREE.Clock();

const periods = [0.240846, 0.615, 1, 1.881, 11.86, 29.46, 84.01, 164.8].map(
	(x) => x * 30
);
const dampings = [
	0.9875, 0.998, 0.9992, 0.9997, 0.99995, 0.99999, 0.99999, 0.99999,
];
const colors = [
	"rgb(81,81,81)",
	"rgb(255,158,67)",
	"rgb(0,181,255)",
	"rgb(244,44,63)",
	"rgb(237,102,53)",
	"rgb(234,187,76)",
	"rgb(198,211,227)",
	"rgb(71,126,253)",
];
const logRadius = [
	2.44, 6.052, 6.371, 3.39, 69.911, 58.232, 25.362, 24.622,
].map((x) => Math.log10(x));
const meshRadius = Array(8)
	.fill(0)
	.map((x, i) => x + (0.2 / logRadius[4]) * logRadius[i]);

const maxParticles = 8;
const particles = new Particles(maxParticles);

const attractor = new THREE.Vector3(0,0,0);

let norms : number[] = [];
let meshes : THREE.Mesh[] = [];
for (let particle of particles){
	const radius = 0.5 * particle.pIndex + 2;
	const norm = radius * ((2 * Math.PI) / periods[particle.pIndex]) **2;
	const speed = Math.sqrt(radius * norm);
	norms.push(norm);	

	particle.setPosition(-radius,0,0);
	particle.setVelocity(0,0,speed);
	particle.setMass(1);
	particle.setDamping(dampings[particle.pIndex]);

	const satelliteMaterial = new THREE.MeshBasicMaterial();
	satelliteMaterial.color.set(colors[particle.pIndex]);
	const satelliteGeometry = new THREE.SphereGeometry(meshRadius[particle.pIndex]);
	const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
	satellite.position.set(-radius,0,0);
	scene.add(satellite);
	meshes.push(satellite);
}

for (let i = 0; i < 8; i++) {
	const orbitGeometry = new THREE.RingGeometry(
		0.5 * i + 1.98,
		0.5 * i + 2.02,
		128
	);
	const orbitMaterial = new THREE.MeshBasicMaterial({
		color: "rgb(255,255,255)",
		side: THREE.DoubleSide,
	});
	const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
	orbit.rotation.set(-Math.PI / 2, 0, 0);
	scene.add(orbit);
}

const sunMaterial = new THREE.MeshBasicMaterial({ color: "rgb(242,221,160)" });
const sunGeometry = new THREE.SphereGeometry(1.5, 64, 32);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const renderer = new THREE.WebGLRenderer({
	//@ts-ignore
	canvas: document.getElementById("canvas"),
	antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

let controls = new OrbitControls(camera, renderer.domElement);

function animate() {
	requestAnimationFrame(animate);

	controls.update();

	addParticleAttractor(particles,attractor,norms);
	particles.integrate(clock.getDelta());	

	updateMeshesArray(particles,meshes);

	renderer.render(scene, camera);
}
animate();
