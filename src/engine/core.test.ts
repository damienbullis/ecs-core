import { expect, test, describe, jest } from 'bun:test';

import { Core, System } from './core';
// import { PlayerEntityState, TurnCount } from './components';

describe('ECS Core', () => {
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
		ecs.update(0);

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

		ecs.update(0);

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

		ecs.update(0);

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

		expect(() => ecs.update(0)).toThrow(
			'Cycle detected in dependency graph',
		);
	});
});
