import { beforeEach, describe, test, expect } from 'bun:test';
import { EntityManager } from '../EntityAdapter/EntityManager';
import { PlayerEntityState, TurnCount } from '../EntityAdapter';

let em: EntityManager;
beforeEach(() => {
	em = new EntityManager();
});

describe('Entity Manager', () => {
	test('Creates entities', () => {
		const entity = em.createEntity();
		em.addComponent(
			entity,
			new PlayerEntityState({ teamId: 0, id: entity }),
		);
		expect(entity).toBe(0);
		expect(em.getAllEntities()[entity].size).toBe(1);
	});

	test('Destroys entities', () => {
		const entity = em.createEntity();
		em.addComponent(
			entity,
			new PlayerEntityState({ teamId: 0, id: entity }),
		);
		expect(em.getAllEntities()[entity].size).toBe(1);
		expect(em.getEntitiesWithComponents(PlayerEntityState)).toEqual([0]);
		em.destroyEntity(entity);
		expect(em.getAllEntities()).toEqual([]);
		expect(em.getEntitiesWithComponents(PlayerEntityState)).toEqual([]);
	});

	test('Adds component', () => {
		const entity = em.createEntity();
		const Turn = new TurnCount();

		em.addComponent(entity, Turn);

		expect(em.getComponent(entity, TurnCount)).toBe(Turn);
		expect(em.getComponent(entity, PlayerEntityState)).toBeUndefined();

		const Player = new PlayerEntityState({ teamId: 0, id: entity });
		em.addComponent(entity, Player);
		expect(em.getComponent(entity, PlayerEntityState)).toBe(Player);
		expect(em.getComponent(entity, TurnCount)).not.toBe(Player);
	});

	test('Adds multiple components', () => {
		const entity = em.createEntity();
		const Turn = new TurnCount();
		const Player = new PlayerEntityState({ teamId: 0, id: entity });

		em.addComponents(entity, [Turn, Player]);

		expect(em.getComponent(entity, TurnCount)).toBe(Turn);
		expect(em.getComponent(entity, PlayerEntityState)).toBe(Player);
	});

	test('Removes component', () => {
		const entity = em.createEntity();
		const Turn = new TurnCount();
		const Player = new PlayerEntityState({ teamId: 0, id: entity });

		em.addComponent(entity, Turn);
		expect(em.getComponent(entity, TurnCount)).toBe(Turn);
		em.addComponent(entity, Player);

		em.removeComponent(entity, Turn);
		expect(em.getComponent(entity, TurnCount)).toBeUndefined();
		expect(em.getComponent(entity, PlayerEntityState)).toBe(Player);
	});

	test('Removes multiple components', () => {
		const entity = em.createEntity();
		const Turn = new TurnCount();
		const Player = new PlayerEntityState({ teamId: 0, id: entity });

		em.addComponent(entity, Turn);
		expect(em.getComponent(entity, TurnCount)).toBe(Turn);
		em.addComponent(entity, Player);

		em.removeComponents(entity, [Turn, Player]);
		expect(em.getComponent(entity, TurnCount)).toBeUndefined();
		expect(em.getComponent(entity, PlayerEntityState)).toBeUndefined();
	});

	test('Get entities with components', () => {
		const entity1 = em.createEntity();
		const entity2 = em.createEntity();
		const Turn = new TurnCount();
		const Player1 = new PlayerEntityState({ teamId: 0, id: entity1 });
		const Player2 = new PlayerEntityState({ teamId: 0, id: entity2 });

		em.addComponents(entity1, [Turn, Player1]);
		em.addComponent(entity2, Player2);

		expect(
			em.getEntitiesWithComponents(TurnCount, PlayerEntityState),
		).toEqual([entity1]);

		expect(em.getEntitiesWithComponents(PlayerEntityState)).toEqual([
			entity1,
			entity2,
		]);
	});

	test('Has component', () => {
		const entity = em.createEntity();
		const Turn = new TurnCount();
		const Player = new PlayerEntityState({ teamId: 0, id: entity });

		em.addComponent(entity, Turn);
		em.addComponent(entity, Player);

		expect(em.hasComponent(entity, TurnCount)).toBe(true);
		expect(em.hasComponent(entity, PlayerEntityState)).toBe(true);

		em.removeComponent(entity, Turn);
		expect(em.hasComponent(entity, TurnCount)).toBe(false);
	});

	test('Get all entities', () => {
		const entity1 = em.createEntity();

		expect(em.getAllEntities().length).toEqual(1);

		const entity2 = em.createEntity();
		const ents = em.getAllEntities();
		expect(ents.length).toEqual(2);
		expect(ents[entity1].size).toBe(0);
		expect(ents[entity2].size).toBe(0);
	});

	test('Pools entities', () => {
		const entity1 = em.createEntity();
		em.destroyEntity(entity1);
		const entity2 = em.createEntity();
		expect(entity2).toBe(entity1);
		const entity3 = em.createEntity();
		expect(entity3).toBe(1);
		em.destroyEntity(entity2);
		const entity4 = em.createEntity();
		expect(entity4).toBe(entity2);
	});
});
