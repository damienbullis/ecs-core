import type { Component, CoreInterface, Entity, System } from './types';
import { DependencyGraph } from './utils';

/** Creates the Core ECS  */
class Core implements CoreInterface {
	//#region Core state
	private nextEntityId = 0;
	private entityPool: Entity[] = [];
	private entities: Map<Function, Component[]>[] = [];
	private componentEntityMap: Map<Function, Entity[]> = new Map();
	private systems: System[] = [];
	private dependencyGraph: DependencyGraph = new DependencyGraph();
	//#endregion

	//#region Entity & Component Methods
	createEntity() {
		let entity: Entity;
		if (this.entityPool.length > 0) {
			entity = this.entityPool.pop()!;
		} else {
			entity = this.nextEntityId++;
		}
		this.entities[entity] = new Map<Function, Component[]>();
		return entity;
	}

	destroyEntity(entity: Entity) {
		const entityComponents = this.entities[entity];
		if (entityComponents) {
			entityComponents.forEach((_, type) => {
				const entitiesWithComponent = this.componentEntityMap.get(type);
				if (entitiesWithComponent) {
					const index = entitiesWithComponent.indexOf(entity);
					if (index !== -1) {
						entitiesWithComponent.splice(index, 1);
					}
				}
			});
			delete this.entities[entity];
		}
		this.entityPool.push(entity);
	}

	addComponent(e: Entity, c: Component) {
		let entityComponents = this.entities[e];
		if (!entityComponents) {
			entityComponents = new Map<Function, Component[]>();
			this.entities[e] = entityComponents;
		}
		const componentsOfType = entityComponents.get(c.constructor) || [];
		componentsOfType.push(c);
		entityComponents.set(c.constructor, componentsOfType);

		let entitiesWithComponent = this.componentEntityMap.get(c.constructor);
		if (!entitiesWithComponent) {
			entitiesWithComponent = [];
			this.componentEntityMap.set(c.constructor, entitiesWithComponent);
		}
		if (!entitiesWithComponent.includes(e)) {
			entitiesWithComponent.push(e);
		}
	}

	removeComponent(e: Entity, c: Component) {
		const entityComponents = this.entities[e];
		if (!entityComponents) {
			throw new Error(`Entity ${e} does not exist`);
		}
		const componentsOfType = entityComponents.get(c.constructor);
		if (componentsOfType) {
			const index = componentsOfType.indexOf(c);
			if (index !== -1) {
				componentsOfType.splice(index, 1);
				if (componentsOfType.length === 0) {
					entityComponents.delete(c.constructor);
				}
			}
		}
		const entitiesWithComponent = this.componentEntityMap.get(
			c.constructor,
		);
		if (entitiesWithComponent) {
			const index = entitiesWithComponent.indexOf(e);
			if (index !== -1) {
				entitiesWithComponent.splice(index, 1);
			}
		}
	}

	addComponents(e: Entity, components: Component[]) {
		let entityComponents = this.entities[e];
		if (!entityComponents) {
			entityComponents = new Map<Function, Component[]>();
			this.entities[e] = entityComponents;
		}
		for (const component of components) {
			const componentsOfType =
				entityComponents.get(component.constructor) || [];
			componentsOfType.push(component);
			entityComponents.set(component.constructor, componentsOfType);

			let entitiesWithComponent = this.componentEntityMap.get(
				component.constructor,
			);
			if (!entitiesWithComponent) {
				entitiesWithComponent = [];
				this.componentEntityMap.set(
					component.constructor,
					entitiesWithComponent,
				);
			}
			if (!entitiesWithComponent.includes(e)) {
				entitiesWithComponent.push(e);
			}
		}
	}

	removeComponents(e: Entity, components: Component[]) {
		let entityComponents = this.entities[e];
		if (!entityComponents) {
			throw new Error(`Entity ${e} does not exist`);
		}
		for (const component of components) {
			const componentsOfType = entityComponents.get(
				component.constructor,
			);
			if (componentsOfType) {
				const index = componentsOfType.indexOf(component);
				if (index !== -1) {
					componentsOfType.splice(index, 1);
					if (componentsOfType.length === 0) {
						entityComponents.delete(component.constructor);
					}
				}
			}

			const entitiesWithComponent = this.componentEntityMap.get(
				component.constructor,
			);
			if (entitiesWithComponent) {
				const index = entitiesWithComponent.indexOf(e);
				if (index !== -1) {
					entitiesWithComponent.splice(index, 1);
				}
			}
		}
	}

	getComponent<T extends Component>(
		entity: Entity,
		type: { new (...args: any[]): T },
	): T | undefined {
		const entityComponents = this.entities[entity];
		if (!entityComponents) {
			console.warn(`Entity ${entity} does not exist`);
			return undefined;
		}
		const componentsOfType = entityComponents.get(type);
		return componentsOfType ? (componentsOfType[0] as T) : undefined;
	}

	getEntitiesWithComponents(...types: Array<Function>): Entity[] {
		if (types.length === 0) return [];

		const sets = types.map(
			(type) => this.componentEntityMap.get(type) || [],
		);

		const [smallestSet, ...restSets] = sets.sort(
			(a, b) => a.length - b.length,
		);

		return smallestSet.filter((entity) =>
			restSets.every((set) => set.includes(entity)),
		);
	}

	hasComponent(entity: Entity, type: Function): boolean {
		const entityComponents = this.entities[entity];
		return entityComponents ? entityComponents.has(type) : false;
	}

	getAllEntities(): Entity[] {
		return this.entities.map((_, entity) => entity);
	}
	//#endregion

	//#region System Methods

	addSystem(system: System): void {
		this.systems.push(system);
		this.dependencyGraph.addSystem(system);
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

	//#endregion
}

export type { Component, Entity } from './types';
export { System } from './types';
export { Core };
