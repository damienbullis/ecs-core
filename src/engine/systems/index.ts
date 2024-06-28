import { CanvasComponent, PlayerEntityState, SpaceState } from '../components';
import { Core, System } from '../core';
import { DependencyGraph } from '../utils';

/**
 * Base interface for components.
 * @interface
 */
export interface Component {}

const INIT_SIZE = 14;

/**
 * System to initialize spaces.
 * - creates the spaces for the game
 * - sets the initial state of the spaces
 * - add locations to players & players to locations
 */
export class InitSpaces extends System {
	constructor(ecs: Core, em: EntityManager, ...players: number[]) {
		super(ecs);

		const playerEntities = players.map((p) =>
			em.getComponent(p, PlayerEntityState),
		);

		let playerCount = 1;
		const distance = Math.floor((INIT_SIZE - players.length) / 3);
		for (let i = 0; i < INIT_SIZE; i++) {
			const s = em.createEntity();
			const space = new SpaceState();
			if (
				playerCount * distance + players.length / 2 === i &&
				playerCount <= players.length
			) {
				// add space to player
				playerEntities[playerCount - 1]!.location = i;

				// add player to space
				space.entities.push(playerCount - 1);

				playerCount++;
			}
			// set the initial state of the spaces
			space.id = s;
			space.location = i;
			em.addComponent(s, space);
		}
	}

	update() {}
}

export class EventBus extends System {
	private channels: { [key: string]: ((data?: any) => void)[] } = {};

	constructor(core: Core) {
		super(core);
	}

	/**
	 * Publish an event to a channel.
	 * @param channel - The event type to publish.
	 * @param data - The data to send with the event.
	 */
	publish(channel: string, data?: any) {
		if (!this.channels[channel]) return;
		this.channels[channel].forEach((callback) => callback(data));
	}

	/**
	 * Subscribe to an event channel.
	 * @param channel - The event type to subscribe to.
	 * @param callback - The function to call when the event is published.
	 */
	subscribe(channel: string, callback: (data?: any) => void) {
		if (!this.channels[channel]) {
			this.channels[channel] = [];
		}
		this.channels[channel].push(callback);
	}

	/**
	 * Unsubscribe from an event channel.
	 * @param channel - The event type to unsubscribe from.
	 * @param callback - The function to remove from the subscription list.
	 */
	unsubscribe(channel: string, callback: (data?: any) => void) {
		if (!this.channels[channel]) return;
		this.channels[channel] = this.channels[channel].filter(
			(cb) => cb !== callback,
		);
	}

	update(): void {}
}

export class Canvas extends System {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;

	constructor(core: Core, entityManager: EntityManager) {
		super(core);
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

		entityManager.addComponent(
			entityManager.createEntity(),
			new CanvasComponent(this.canvas),
		);

		document.body.appendChild(this.canvas);
		window.addEventListener('resize', this.resize.bind(this));
		this.resize();
	}

	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	update(_: number) {
		// Clear the canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

export class Deferred extends System {
	private deferred: (() => void)[] = [];
	private currentIndex = 0;
	private entityManager: EntityManager;

	constructor(core: Core, entityManager: EntityManager) {
		super(core);
		this.entityManager = entityManager;
	}

	/**
	 * All purpose defer function.
	 * @param callback - The callback to defer.
	 */
	defer(callback: () => void) {
		this.deferred.push(callback);
	}

	update() {
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

	// Standard core methods that are deferred

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

export class EntityManager extends System {
	private nextEntityId = 0;
	private entityPool: number[] = [];
	private entities: Map<Function, Component[]>[] = [];
	private componentEntityMap: Map<Function, number[]> = new Map();

	constructor(core: Core) {
		super(core);
	}
	// Do nothing
	update() {}

	/**
	 * Creates a new entity.
	 * @returns The newly created entity.
	 */
	createEntity() {
		let entity: number;
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
	destroyEntity(entity: number) {
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
	addComponent(e: number, c: Component) {
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
	removeComponent(e: number, c: Component) {
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
	addComponents(e: number, components: Component[]) {
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
	removeComponents(e: number, components: Component[]) {
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
		entity: number,
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
	getEntitiesWithComponents(...types: Array<Function>): number[] {
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
	hasComponent(entity: number, type: Function): boolean {
		const entityComponents = this.entities[entity];
		return entityComponents ? entityComponents.has(type) : false;
	}

	/**
	 * Retrieves all entities in the ECS.
	 * @returns The list of all entities.
	 */
	getAllEntities(): number[] {
		return this.entities.map((_, entity) => entity);
	}
}

export class SystemManager extends System {
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
	update(deltaTime: number) {
		this.dependencyGraph
			.topologicalSort()
			.map((system) => system.update(deltaTime));
	}
}
