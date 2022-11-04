const maxParticles = 4;

//0-2: position, 3-5: velocity, 6-8: acceleration (forceAccum is redundant), 9: damping, 10: 1/mass
const particleLength = 11;

let particles = new Float32Array(maxParticles*particleLength);

for (let i=0; i < maxParticles*particleLength; i+=particleLength) {
	particles[i+9] = 0.9999; // default damping
}

function setPosition(position,particleIndex) {
	particles[particleIndex*particleLength] = position[0];
	particles[particleIndex*particleLength+1] = position[1];
	particles[particleIndex*particleLength+2] = position[2];
}

function setVelocity(velocity,particleIndex) {
	particles[particleIndex*particleLength+3] = velocity[0];
	particles[particleIndex*particleLength+4] = velocity[1];
	particles[particleIndex*particleLength+5] = velocity[2];
}

function setDamping(damping,particleIndex) {
	particles[particleIndex*particleLength+9] = damping;
}

function addForce(force,particleIndex) {
	const inverseMass = particles[particleIndex*particleLength+10];
	particles[particleIndex*particleLength+6] += force[0]*inverseMass;
	particles[particleIndex*particleLength+7] += force[1]*inverseMass;
	particles[particleIndex*particleLength+8] += force[2]*inverseMass;
}

function setMass(mass,particleIndex) {
	if (mass == 0) {
		throw new Error("mass cannot be zero!");
	}
	particles[particleIndex*particleLength+10] = 1/mass;
}

function getMass(particleIndex) {
	const inverseMass = particles[particleIndex*particleLength+10];
	if (inverseMass == 0) {
		return Infinity;
	} else {
		return 1/inverseMass;
	}
}

function updateForce(dt,particleIndex) {
	// calculate delta force = (force at next time step) - (force at current time step)
	const deltaForce = [0,0,0]; // temp
	addForce(deltaForce,particleIndex);
}

function integrate(dt) {
	for (let i=0; i < maxParticles*particleLength; i+=particleLength){
		for (let j=0; j < 3; j++){
			particles[i+j] += dt*particles[i+j+3]; // update position
			particles[i+j+3] += dt*particles[i+j+6]; // update velocity
			particles[i+j+3] *= particles[i+9]**dt; // impose drag
		}
		updateForce(dt,i/particleLength);
	}
}

// example
setPosition([1,1,1],0);
setVelocity([2,0,0],0);
setMass(5,0);
addForce([0,5*-10,0],0);
integrate(0.1);

console.log(particles);
