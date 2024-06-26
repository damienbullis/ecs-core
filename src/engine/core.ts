// TODO: refactor to remove types.ts and use core.ts
import type { CoreInterface, System } from './types';
import { DependencyGraph } from './utils';

/**
 * Core Engine
 *
 * This is a variant of an ECS Engine, not sure what to call this, maybe just Systems Pattern
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

	update(deltaTime: number): void {
		this.dependencyGraph
			.topologicalSort()
			.map((system) => system.update(deltaTime));
	}
}

export { System } from './types';
export { Core };
