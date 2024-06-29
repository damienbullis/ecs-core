/**
 * Base class for systems.
 * @class
 */
export abstract class System {
	/**
	 * Update the system.
	 * @param deltaTime - The time elapsed since the last update call.
	 */
	abstract run(deltaTime: number): void | Promise<void>;
}

/**
 * Core Engine
 *
 * This is a variant of an ECS Engine, not sure what to call this, maybe just Systems Pattern
 */
export class Core<S = System> {
	private systems: S[] = [];

	/**
	 * Add a system to the Core.
	 */
	add<T extends S>(system: T): T {
		this.systems.push(system);
		return system;
	}

	/**
	 * Retrieves all systems of a specified type from the Core.
	 * @param system - The constructor of the system type.
	 */
	get<T extends S>(system: { new (...args: never[]): T }) {
		return this.systems.filter((s) => s instanceof system) as T[];
	}
}
