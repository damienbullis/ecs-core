import { expect, test, describe, jest } from 'bun:test';

import { Core, System } from './core';
import { PlayerEntityState, TurnCount } from './components';

describe('ECS Core', () => {
	test('Creates entities', () => {
		const ecs = new Core();
		const entity = ecs.createEntity();
		ecs.addComponent(
			entity,
			new PlayerEntityState({ teamId: 0, id: entity }),
		);
		expect(entity).toBe(0);
		expect(ecs.getAllEntities()).toEqual([0]);
	});

	test('Destroys entities', () => {
		const ecs = new Core();
		const entity = ecs.createEntity();
		ecs.addComponent(
			entity,
			new PlayerEntityState({ teamId: 0, id: entity }),
		);
		expect(ecs.getAllEntities()).toEqual([0]);
		expect(ecs.getEntitiesWithComponents(PlayerEntityState)).toEqual([0]);
		ecs.destroyEntity(entity);
		expect(ecs.getAllEntities()).toEqual([]);
		expect(ecs.getEntitiesWithComponents(PlayerEntityState)).toEqual([]);
	});

	test('Adds component', () => {
		const ecs = new Core();
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

	test('Adds multiple components', () => {
		const ecs = new Core();
		const entity = ecs.createEntity();
		const Turn = new TurnCount();
		const Player = new PlayerEntityState({ teamId: 0, id: entity });

		ecs.addComponents(entity, [Turn, Player]);

		expect(ecs.getComponent(entity, TurnCount)).toBe(Turn);
		expect(ecs.getComponent(entity, PlayerEntityState)).toBe(Player);
	});

	test('Removes component', () => {
		const ecs = new Core();
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

	test('Removes multiple components', () => {
		const ecs = new Core();
		const entity = ecs.createEntity();
		const Turn = new TurnCount();
		const Player = new PlayerEntityState({ teamId: 0, id: entity });

		ecs.addComponent(entity, Turn);
		expect(ecs.getComponent(entity, TurnCount)).toBe(Turn);
		ecs.addComponent(entity, Player);

		ecs.removeComponents(entity, [Turn, Player]);
		expect(ecs.getComponent(entity, TurnCount)).toBeUndefined();
		expect(ecs.getComponent(entity, PlayerEntityState)).toBeUndefined();
	});

	test('Get entities with components', () => {
		const ecs = new Core();
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
		const ecs = new Core();
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
		const ecs = new Core();
		const entity1 = ecs.createEntity();

		expect(ecs.getAllEntities()).toEqual([entity1]);

		const entity2 = ecs.createEntity();
		expect(ecs.getAllEntities()).toEqual([entity1, entity2]);
	});

	test('Pools entities', () => {
		const ecs = new Core();

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
		const ecs = new Core();
		const S = class extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {
				return;
			}
		};
		const system = new S(ecs);
		ecs.addSystem(system);

		expect(ecs.getSystem(S)).toBe(system);
	});

	test('Update systems', async () => {
		const ecs = new Core();
		const fn = jest.fn();
		const S = class extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update = fn;
		};
		const system = new S(ecs);
		ecs.addSystem(system);
		await ecs.update(0);

		expect(fn).toHaveBeenCalledWith(0);
	});

	test('Systems execute in correct order', async () => {
		const ecs = new Core();
		const order: string[] = [];

		class SystemA extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {
				order.push('A');
			}
		}

		class SystemB extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {
				order.push('B');
			}
		}

		class SystemC extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {
				order.push('C');
			}
		}

		const systemA = new SystemA(ecs);
		const systemB = new SystemB(ecs);
		const systemC = new SystemC(ecs);

		ecs.addSystem(systemA);
		ecs.addSystem(systemB);
		ecs.addSystem(systemC);

		// Setting up dependencies: A -> B -> C
		ecs.addDependency(systemA, systemB);
		ecs.addDependency(systemB, systemC);

		await ecs.update(0);

		expect(order).toEqual(['C', 'B', 'A']);
	});

	test('Handles multiple independent systems', async () => {
		const ecs = new Core();
		const order: string[] = [];

		class SystemA extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {
				order.push('A');
			}
		}

		class SystemB extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {
				order.push('B');
			}
		}

		class SystemC extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {
				order.push('C');
			}
		}

		const systemA = new SystemA(ecs);
		const systemB = new SystemB(ecs);
		const systemC = new SystemC(ecs);

		ecs.addSystem(systemA);
		ecs.addSystem(systemB);
		ecs.addSystem(systemC);

		await ecs.update(0);

		expect(order).toEqual(expect.arrayContaining(['A', 'B', 'C']));
	});

	test('Cycles in dependencies throw error', () => {
		const ecs = new Core();

		class SystemA extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {}
		}

		class SystemB extends System {
			constructor(ecs: Core) {
				super(ecs);
			}
			update(_: number) {}
		}

		const systemA = new SystemA(ecs);
		const systemB = new SystemB(ecs);

		ecs.addSystem(systemA);
		ecs.addSystem(systemB);

		// Creating a cyclic dependency: A -> B -> A
		ecs.addDependency(systemA, systemB);
		ecs.addDependency(systemB, systemA);

		expect(ecs.update(0)).rejects.toThrow(
			'Cycle detected in dependency graph',
		);
	});
});
