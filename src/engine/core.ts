// Core Engine Classes & Types

type Entity = number;
interface Component {}
interface System {
	update(deltaTime: number): void;
}

class EntityManager {
	private nextEntityId = 0;
	private entities = new Set<Entity>();
	private components = new Map<Entity, Map<Function, Component>>();

	createEntity() {
		const entity = this.nextEntityId++;
		this.entities.add(entity);
		this.components.set(entity, new Map());
		return entity;
	}

	destroyEntity(entity: Entity) {
		this.entities.delete(entity);
		this.components.delete(entity);
	}

	addComponent<T extends Component>(entity: Entity, component: T) {
		const componentType = component.constructor as Function;
		const entityComponents = this.components.get(entity);
		if (!entityComponents) {
			throw new Error(`Entity ${entity} does not exist`);
		}

		entityComponents.set(componentType, component);
	}

	removeComponent<T extends Component>(
		entity: Entity,
		componentType: new () => T,
	) {
		const entityComponents = this.components.get(entity);
		if (!entityComponents) {
			throw new Error(`Entity ${entity} does not exist`);
		}

		entityComponents.delete(componentType);
	}

	getComponent<T extends Component>(
		entity: Entity,
		componentType: new () => T,
	): T | undefined {
		const entityComponents = this.components.get(entity);
		return entityComponents?.get(componentType) as T;
	}

	hasComponent<T extends Component>(
		entity: Entity,
		componentType: new () => T,
	): boolean {
		const entityComponents = this.components.get(entity);
		return entityComponents ? entityComponents.has(componentType) : false;
	}

	getAllEntities(): Entity[] {
		return Array.from(this.entities);
	}
}

abstract class BaseSystem implements System {
	protected entityManager: EntityManager;

	constructor(entityManager: EntityManager) {
		this.entityManager = entityManager;
	}

	abstract update(deltaTime: number): void;

	protected getEntitiesWithComponents<T extends Component>(
		...componentTypes: Array<new () => T>
	): Entity[] {
		return this.entityManager
			.getAllEntities()
			.filter((entity) =>
				componentTypes.every((componentType) =>
					this.entityManager.hasComponent(entity, componentType),
				),
			);
	}
}
