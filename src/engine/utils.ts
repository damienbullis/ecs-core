import { System } from './core';

export class DependencyGraph {
	private adjList: Map<System, System[]> = new Map();
	private cachedSort: System[] | null = null;
	private isDirty: boolean = true;

	addSystem(system: System): void {
		if (!this.adjList.has(system)) {
			this.adjList.set(system, []);
			this.isDirty = true;
		}
	}

	addDependency(system: System, dependency: System): void {
		if (this.adjList.has(system) && this.adjList.has(dependency)) {
			this.adjList.get(system)!.push(dependency);
			this.isDirty = true;
		} else {
			throw new Error('System or dependency not found in graph');
		}
	}

	getDependencies(system: System): System[] {
		return this.adjList.get(system) || [];
	}

	getSystems(): System[] {
		return Array.from(this.adjList.keys());
	}

	hasCycle(): boolean {
		let visited = new Set<System>();
		let recStack = new Set<System>();

		for (let system of this.getSystems()) {
			if (this.hasCycleUtil(system, visited, recStack)) {
				return true;
			}
		}
		return false;
	}

	private hasCycleUtil(
		system: System,
		visited: Set<System>,
		recStack: Set<System>,
	): boolean {
		if (!visited.has(system)) {
			visited.add(system);
			recStack.add(system);

			for (let dep of this.getDependencies(system)) {
				if (
					!visited.has(dep) &&
					this.hasCycleUtil(dep, visited, recStack)
				) {
					return true;
				} else if (recStack.has(dep)) {
					return true;
				}
			}
		}
		recStack.delete(system);
		return false;
	}

	topologicalSort(): System[] {
		if (this.cachedSort && !this.isDirty) {
			return this.cachedSort;
		}

		let inDegree = new Map<System, number>();
		for (let system of this.getSystems()) {
			inDegree.set(system, 0);
		}
		for (let system of this.getSystems()) {
			for (let dep of this.getDependencies(system)) {
				inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
			}
		}

		let queue: System[] = [];
		for (let [system, degree] of inDegree.entries()) {
			if (degree === 0) {
				queue.push(system);
			}
		}

		let sortedSystems: System[] = [];
		while (queue.length > 0) {
			let current = queue.shift()!;
			sortedSystems.push(current);

			for (let dep of this.getDependencies(current)) {
				inDegree.set(dep, inDegree.get(dep)! - 1);
				if (inDegree.get(dep) === 0) {
					queue.push(dep);
				}
			}
		}

		if (sortedSystems.length !== this.getSystems().length) {
			throw new Error('Cycle detected in dependency graph');
		}

		// Execute systems in reverse order
		sortedSystems.reverse();
		this.cachedSort = sortedSystems;
		this.isDirty = false;
		return sortedSystems;
	}

	getDirty(): boolean {
		return this.isDirty;
	}
}
