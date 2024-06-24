/**
 * Type representing an entity as a unique identifier (number).
 */
export type Entity = number;

/**
 * Interface representing a component.
 * @interface
 */
export interface Component {}

/**
 * Interface representing a system with an update method.
 * @interface
 */

/**
 * Base class for systems.
 * @class
 */
export abstract class System {
	/**
	 * Constructor for the System class.
	 * @param ecs - The ECS core to use.
	 */
	constructor(protected ecs: ECSCore) {
		this.ecs = ecs;
	}

	/**
	 * Update method to be called every frame with deltaTime.
	 * @param deltaTime - The time elapsed since the last update call.
	 */
	abstract update(deltaTime: number): void | Promise<void>;
}

/**
 * Class representing the core of the ECS engine.
 * @class
 */
export class ECSCore {
	private nextEntityId = 0;
	private entityPool: Entity[] = [];
	private entities: Map<Function, Component[]>[] = [];
	private componentEntityMap: Map<Function, Entity[]> = new Map();
	private systems: Map<Function, System> = new Map();

	/**
	 * Adds a system to the ECS.
	 * @param system - The system to add.
	 */
	addSystem(system: System) {
		this.systems.set(system.constructor, system);
	}

	/**
	 * Retrieves a system of a specified type.
	 * @template T
	 * @param type - The constructor of the system type.
	 * @returns The instance of the requested system.
	 */
	getSystem<T extends System>(type: { new (...args: any[]): T }): T {
		return this.systems.get(type) as T;
	}

	/**
	 * Updates all systems.
	 * @param deltaTime - The time elapsed since the last update call.
	 */
	async updateSystems(deltaTime: number) {
		await Promise.all(
			// Array.from(this.systems.values()).map((system) => system.update(deltaTime)),
			[
				this.systems.forEach(
					(system) => system.update && system.update(deltaTime),
				),
			],
		);
	}

	/**
	 * Creates a new entity.
	 * @returns The newly created entity.
	 */
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

	/**
	 * Destroys an entity.
	 * @param entity - The entity to destroy.
	 */
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

	/**
	 * Adds a component to an entity.
	 * @param e - The entity to add the component to.
	 * @param c - The component to add.
	 */
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

	/**
	 * Removes a component from an entity.
	 * @param e - The entity to remove the component from.
	 * @param c - The component to remove.
	 */
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

	/**
	 * Adds multiple components to an entity.
	 * @param e - The entity to add components to.
	 * @param components - The components to add.
	 */
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

	/**
	 * Removes multiple components from an entity.
	 * @param e - The entity to remove components from.
	 * @param components - The components to remove.
	 */
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

	/**
	 * Retrieves a component of a specified type from an entity.
	 * @template T
	 * @param entity - The entity to retrieve the component from.
	 * @param type - The constructor of the component type.
	 * @returns The instance of the requested component, or undefined if not found.
	 */
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

	/**
	 * Retrieves entities that have all specified component types.
	 * @param types - The constructors of the component types.
	 * @returns The list of entities that have all specified components.
	 */
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

	/**
	 * Checks if an entity has a component of a specified type.
	 * @param entity - The entity to check.
	 * @param type - The constructor of the component type.
	 * @returns True if the entity has the component, false otherwise.
	 */
	hasComponent(entity: Entity, type: Function): boolean {
		const entityComponents = this.entities[entity];
		return entityComponents ? entityComponents.has(type) : false;
	}

	/**
	 * Retrieves all entities in the ECS.
	 * @returns The list of all entities.
	 */
	getAllEntities(): Entity[] {
		return this.entities.map((_, entity) => entity);
	}
}
