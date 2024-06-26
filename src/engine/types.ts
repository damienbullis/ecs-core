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
 * Base class for systems.
 * @class
 */
export abstract class System {
	constructor(protected core: CoreInterface) {
		this.core = core;
	}

	/**
	 * Update the system.
	 * @param deltaTime - The time elapsed since the last update call.
	 */
	abstract update(deltaTime: number): void | Promise<void>;
}

export interface CoreInterface {
	/**
	 * Creates a new entity.
	 * @returns The newly created entity.
	 */
	createEntity(): Entity;

	/**
	 * Destroys an entity.
	 * @param entity - The entity to destroy.
	 */
	destroyEntity(entity: Entity): void;

	/**
	 * Adds a component to an entity.
	 * @param e - The entity to add the component to.
	 * @param c - The component to add.
	 */
	addComponent(e: Entity, c: Component): void;

	/**
	 * Removes a component from an entity.
	 * @param e - The entity to remove the component from.
	 * @param c - The component to remove.
	 */
	removeComponent(e: Entity, c: Component): void;

	/**
	 * Adds multiple components to an entity.
	 * @param e - The entity to add components to.
	 * @param components - The components to add.
	 */
	addComponents(e: Entity, components: Component[]): void;

	/**
	 * Removes multiple components from an entity.
	 * @param e - The entity to remove components from.
	 * @param components - The components to remove.
	 */
	removeComponents(e: Entity, components: Component[]): void;

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
	): T | undefined;

	/**
	 * Retrieves entities that have all specified component types.
	 * @param types - The constructors of the component types.
	 * @returns The list of entities that have all specified components.
	 */
	getEntitiesWithComponents(...types: Array<Function>): Entity[];

	/**
	 * Checks if an entity has a component of a specified type.
	 * @param entity - The entity to check.
	 * @param type - The constructor of the component type.
	 * @returns True if the entity has the component, false otherwise.
	 */
	hasComponent(entity: Entity, type: Function): boolean;

	/**
	 * Retrieves all entities in the ECS.
	 * @returns The list of all entities.
	 */
	getAllEntities(): Entity[];

	/**
	 * Add a system to the ECS.
	 * Updates the dependency graph with the new system.
	 * @param system - The system to add.
	 */
	addSystem(system: System): void;

	/**
	 * Retrieves a system of a specified type from the ECS.
	 * @template T
	 * @param system - The constructor of the system type.
	 * @returns The instance of the requested system, or undefined if not found.
	 */
	getSystem<T extends System>(system: {
		new (...args: any[]): T;
	}): T | undefined;

	/**
	 * Add a dependency between two systems.
	 * Updates the dependency graph with the new dependency.
	 * @param system - The system to add the dependency to.
	 * @param dependency - The dependency system.
	 */
	addDependency(system: System, dependency: System): void;

	/**
	 * Update all systems in the ECS.
	 * Updates systems in the order determined by the dependency graph.
	 * @param deltaTime - The time elapsed since the last update call.
	 */
	update(deltaTime: number): Promise<void>;
}
