// TODO: figure out how we want to sync/update graphics with new data structure

updateGraphics() {
	for (let particle of this.particles) {
		if (particle.mesh !== undefined) {
			particle.mesh.position.set(
			particle.position.x,
			particle.position.y,
			particle.position.z
			);
		}
	}
}
