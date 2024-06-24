import { expect, test, describe, jest } from 'bun:test';
import { ECSCore, System } from './core';
import { PlayerEntityState, TurnCount } from './components';

describe('ECS Core', () => {
	test('Creates entities', () => {
		const ecs = new ECSCore();
		const entity = ecs.createEntity();
		ecs.addComponent(
			entity,
			new PlayerEntityState({ teamId: 0, id: entity }),
		);
		expect(entity).toBe(0);
		expect(ecs.getAllEntities()).toEqual([0]);
	});

	test('Destroys entities', () => {
		const ecs = new ECSCore();
		const entity = ecs.createEntity();
		ecs.destroyEntity(entity);
		expect(ecs.getAllEntities()).toEqual([]);
	});

	test('Adds components', () => {
		const ecs = new ECSCore();
		const entity = ecs.createEntity();
		const Turn = new TurnCount();

		ecs.addComponent(entity, Turn);

		expect(ecs.getComponent(entity, TurnCount)).toBe(Turn);
		expect(ecs.getComponent(entity, PlayerEntityState)).toBeUndefined();

		const Player = new PlayerEntityState({ teamId: 0, id: entity });
		ecs.addComponent(entity, Player);
		expect(ecs.getComponent(entity, PlayerEntityState)).toBe(Player);
		expect(ecs.getComponent(entity, TurnCount)).not.toBe(Player);
	});

	test('Removes components', () => {
		const ecs = new ECSCore();
		const entity = ecs.createEntity();
		const Turn = new TurnCount();
		const Player = new PlayerEntityState({ teamId: 0, id: entity });

		ecs.addComponent(entity, Turn);
		expect(ecs.getComponent(entity, TurnCount)).toBe(Turn);
		ecs.addComponent(entity, Player);

		ecs.removeComponent(entity, Turn);
		expect(ecs.getComponent(entity, TurnCount)).toBeUndefined();
		expect(ecs.getComponent(entity, PlayerEntityState)).toBe(Player);
	});

	test('Get entities with components', () => {
		const ecs = new ECSCore();
		const entity1 = ecs.createEntity();
		const entity2 = ecs.createEntity();
		const Turn = new TurnCount();
		const Player1 = new PlayerEntityState({ teamId: 0, id: entity1 });
		const Player2 = new PlayerEntityState({ teamId: 0, id: entity2 });

		ecs.addComponents(entity1, [Turn, Player1]);
		ecs.addComponent(entity2, Player2);

		expect(
			ecs.getEntitiesWithComponents(TurnCount, PlayerEntityState),
		).toEqual([entity1]);

		expect(ecs.getEntitiesWithComponents(PlayerEntityState)).toEqual([
			entity1,
			entity2,
		]);
	});

	test('Has component', () => {
		const ecs = new ECSCore();
		const entity = ecs.createEntity();
		const Turn = new TurnCount();
		const Player = new PlayerEntityState({ teamId: 0, id: entity });

		ecs.addComponent(entity, Turn);
		ecs.addComponent(entity, Player);

		expect(ecs.hasComponent(entity, TurnCount)).toBe(true);
		expect(ecs.hasComponent(entity, PlayerEntityState)).toBe(true);

		ecs.removeComponent(entity, Turn);
		expect(ecs.hasComponent(entity, TurnCount)).toBe(false);
	});

	test('Get all entities', () => {
		const ecs = new ECSCore();
		const entity1 = ecs.createEntity();

		expect(ecs.getAllEntities()).toEqual([entity1]);

		const entity2 = ecs.createEntity();
		expect(ecs.getAllEntities()).toEqual([entity1, entity2]);
	});

	test('Pools entities', () => {
		const ecs = new ECSCore();

		const entity1 = ecs.createEntity();
		ecs.destroyEntity(entity1);
		const entity2 = ecs.createEntity();
		expect(entity2).toBe(entity1);
		const entity3 = ecs.createEntity();
		expect(entity3).toBe(1);
		ecs.destroyEntity(entity2);
		const entity4 = ecs.createEntity();
		expect(entity4).toBe(entity2);
	});

	test('Add system', () => {
		const em = new ECSCore();
		const S = class extends System {
			constructor(ecs: ECSCore) {
				super(ecs);
			}
			update(_: number) {
				return;
			}
		};
		const system = new S(em);
		em.addSystem(system);

		expect(em.getSystem(S)).toBe(system);
	});

	test('Update systems', async () => {
		const ecs = new ECSCore();
		const fn = jest.fn();
		const S = class extends System {
			constructor(ecs: ECSCore) {
				super(ecs);
			}
			update = fn;
		};
		const system = new S(ecs);
		ecs.addSystem(system);
		await ecs.updateSystems(0);

		expect(fn).toHaveBeenCalledWith(0);
	});
});
