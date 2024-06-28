/**
 * Base class for systems.
 * @class
 */
export abstract class System {
	constructor(protected core: Core) {
		this.core = core;
	}

	/**
	 * Update the system.
	 * @param deltaTime - The time elapsed since the last update call.
	 */
	abstract update(deltaTime: number): void | Promise<void>;
}

/**
 * Core Engine
 *
 * This is a variant of an ECS Engine, not sure what to call this, maybe just Systems Pattern
 */
export class Core {
	private systems: System[] = [];

	/**
	 * Add a system to the Core.
	 */
	add<T extends System>(system: T): T {
		this.systems.push(system);
		return system;
	}

	/**
	 * Retrieves all systems of a specified type from the Core.
	 * @param system - The constructor of the system type.
	 */
	get<T extends System>(system: { new (...args: any[]): T }) {
		return this.systems.filter((s) => s instanceof system) as T[];
	}
}
