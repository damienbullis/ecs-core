import { System } from '../core';
import { Component, EntityManager } from './EntityManager';

export class Deferred extends System {
	private deferred: (() => void)[] = [];
	private currentIndex = 0;
	private entityManager: EntityManager;

	constructor(entityManager: EntityManager) {
		super();
		this.entityManager = entityManager;
	}

	/**
	 * All purpose defer function.
	 * @param callback - The callback to defer.
	 */
	defer(callback: () => void) {
		this.deferred.push(callback);
	}

	run() {
		while (this.currentIndex < this.deferred.length) {
			try {
				this.deferred[this.currentIndex++]();
			} catch (error) {
				console.error('Error processing deferred operation:', error);
			}
		}
		// Reset the array and index
		this.deferred.length = 0;
		this.currentIndex = 0;
	}

	/**
	 * Defer the creation of an entity.
	 */
	deferCreate(): void {
		this.defer(() => {
			try {
				this.entityManager.createEntity();
			} catch (error) {
				console.error('Error creating entity:', error);
			}
		});
	}

	/**
	 * Defer the destruction of an entity.
	 * @param entity The entity to destroy.
	 */
	deferDestroy(entity: number): void {
		this.defer(() => {
			try {
				this.entityManager.destroyEntity(entity);
			} catch (error) {
				console.error('Error destroying entity:', error);
			}
		});
	}

	/**
	 * Defer adding a component to an entity.
	 * @param entity The entity to add the component to.
	 * @param component The component to add.
	 */
	deferAdd(entity: number, component: Component): void {
		this.defer(() => {
			try {
				this.entityManager.addComponent(entity, component);
			} catch (error) {
				console.error('Error adding component:', error);
			}
		});
	}

	/**
	 * Defer removing a component from an entity.
	 * @param entity The entity to remove the component from.
	 * @param component The component to remove.
	 */
	deferRemove(entity: number, component: Component): void {
		this.defer(() => {
			try {
				this.entityManager.removeComponent(entity, component);
			} catch (error) {
				console.error('Error removing component:', error);
			}
		});
	}
}
