import { Core, System } from '../../core';
import { DependencyGraph } from './DependencyGraph';

export class SystemGraph extends System {
	private dependencyGraph: DependencyGraph = new DependencyGraph();

	constructor(core: Core) {
		super(core);
	}

	/**
	 * Add a system to the Core
	 * Updates the dependency graph with the new system.
	 * @param system - The system to add.
	 */
	addSystem<T extends System>(system: T) {
		this.dependencyGraph.addSystem(system);
		return this.core.add(system);
	}

	/**
	 * Add a dependency between two systems.
	 * Updates the dependency graph with the new dependency.
	 * @param system - The system to add the dependency to.
	 * @param dependency - The dependency system.
	 */
	addDependency(system: System, dependency: System) {
		this.dependencyGraph.addDependency(system, dependency);
	}

	/**
	 * Update all systems in the SystemManager.
	 * Updates systems in the order determined by the dependency graph.
	 * @param deltaTime - The time elapsed since the last update call.
	 */
	run(deltaTime: number) {
		this.dependencyGraph
			.topologicalSort()
			.map((system) => system.run(deltaTime));
	}
}
