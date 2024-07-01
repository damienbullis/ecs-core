/**
 * System interface
 *
 * @class
 * @interface System
 * @abstract - This class is meant to be extended but not instantiated.
 */
export abstract class System {
	/**
	 * Update the system.
	 * @param deltaTime - The time elapsed since the last update call.
	 */
	abstract run(deltaTime: number): void | Promise<void>;
}

/**
 * Systems Core Engine
 */
export class Core<S = System> {
	private systems: S[] = [];

	/**
	 * Add a system to the Core.
	 * @param system - The instance of the system to add.
	 */
	add<T extends S>(system: T): T {
		this.systems.push(system);
		return system;
	}

	/**
	 * Retrieves all systems of a specified type from the Core.
	 * @param system - The system class to retrieve.
	 */
	get<T extends S>(system: { new (...args: never[]): T }) {
		return this.systems.filter((s) => s instanceof system) as T[];
	}
}
