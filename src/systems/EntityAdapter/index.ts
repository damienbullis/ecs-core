import { EntityManager, type Component } from './EntityManager';
import { System } from '../../core';

export class EntityAdapter extends System {
	private entityManager: EntityManager = new EntityManager(); // The internal dependency

	run() {} // No-op

	/**
	 * Create a new entity.
	 */
	create(): number {
		return this.entityManager.createEntity();
	}

	/**
	 * Destroy an entity.
	 */
	destroy(entity: number): void {
		return this.entityManager.destroyEntity(entity);
	}

	/**
	 * Add a component or components to an entity.
	 */
	add(entity: number, component: Component | Component[]): void {
		if (Array.isArray(component))
			return this.entityManager.addComponents(entity, component);
		return this.entityManager.addComponent(entity, component);
	}

	/**
	 * Remove a component or components from an entity.
	 */
	remove(entity: number, component: Component | Component[]): void {
		if (Array.isArray(component))
			return this.entityManager.removeComponents(entity, component);
		return this.entityManager.removeComponent(entity, component);
	}

	/**
	 * Check if an entity has a component.
	 */
	has(entity: number, component: Component): boolean {
		return this.entityManager.hasComponent(entity, component.constructor);
	}

	/**
	 * Get a component from an entity.
	 */
	get<T extends Component>(
		entity: number,
		type: { new (...args: any[]): T },
	): T | undefined {
		return this.entityManager.getComponent(entity, type);
	}

	// /**
	//  * Get an entity or entities.
	//  */
	// get(entity: number): Map<Function, Component[]>;
	// get(entities: number[]): Map<Function, Component[]>[];
	// get(): Map<Function, Component[]>[];
	// get(e?: number | number[]) {
	// 	if (e === undefined) return this.entityManager.getAllEntities();
	// 	if (Array.isArray(e)) {
	// 		const entities = this.entityManager.getAllEntities();
	// 		return e.map((e) => entities[e]);
	// 	}
	// 	return this.entityManager.getAllEntities()[e];
	// }

	/**
	 * Get entities with the specified components.
	 */
	with(...types: Array<Function>) {
		return this.entityManager.getEntitiesWithComponents(...types);
	}
}

export type { Component };
