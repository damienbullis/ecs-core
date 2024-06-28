import { describe, expect, test } from 'bun:test';
import { Core, System } from '../core';
import { SystemManager } from '.';

describe('SystemManager', () => {
	test('Add system to core', () => {
		const ecs = new Core();
		const sm = ecs.add(new SystemManager(ecs));

		const [added] = ecs.get(SystemManager);

		expect(added).toBe(sm);
	});
	test('Systems execute in correct order', async () => {
		const core = new Core();
		const sm = core.add(new SystemManager(core));
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

		const systemA = new SystemA(core);
		const systemB = new SystemB(core);
		const systemC = new SystemC(core);

		sm.addSystem(systemA);
		sm.addSystem(systemB);
		sm.addSystem(systemC);

		// Setting up dependencies: A -> B -> C
		sm.addDependency(systemA, systemB);
		sm.addDependency(systemB, systemC);

		sm.update(0);

		expect(order).toEqual(['C', 'B', 'A']);
	});

	test('Handles multiple independent systems', async () => {
		const core = new Core();
		const sm = new SystemManager(core);
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

		const systemA = new SystemA(core);
		const systemB = new SystemB(core);
		const systemC = new SystemC(core);

		sm.addSystem(systemA);
		sm.addSystem(systemB);
		sm.addSystem(systemC);

		sm.update(0);

		expect(order).toEqual(expect.arrayContaining(['A', 'B', 'C']));
	});

	test('Cycles in dependencies throw error', () => {
		const core = new Core();
		const sm = new SystemManager(core);

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

		const systemA = new SystemA(core);
		const systemB = new SystemB(core);

		sm.addSystem(systemA);
		sm.addSystem(systemB);

		// Creating a cyclic dependency: A -> B -> A
		sm.addDependency(systemA, systemB);
		sm.addDependency(systemB, systemA);

		expect(() => sm.update(0)).toThrow(
			'Cycle detected in dependency graph',
		);
	});
});
