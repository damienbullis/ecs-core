import type { CoreInterface, System } from './types';
import { DependencyGraph } from './utils';

/**
 * Creates the Core ECS
 */
class Core implements CoreInterface {
	private systems: System[] = [];
	private dependencyGraph: DependencyGraph = new DependencyGraph();

	addSystem<T extends System>(system: T): T {
		this.systems.push(system);
		this.dependencyGraph.addSystem(system);
		return system;
	}

	getSystem<T extends System>(system: { new (...args: any[]): T }) {
		return this.systems.find((s) => s instanceof system) as T | undefined;
	}

	addDependency(system: System, dependency: System): void {
		this.dependencyGraph.addDependency(system, dependency);
	}

	async update(deltaTime: number): Promise<void> {
		const sortedSystems = this.dependencyGraph.topologicalSort();
		await Promise.all(
			sortedSystems.map((system) => system.update(deltaTime)),
		);
	}
}

export type { Component, Entity } from './types';
export { System } from './types';
export { Core };
