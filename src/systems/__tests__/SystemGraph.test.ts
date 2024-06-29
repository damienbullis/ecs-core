import { describe, expect, test } from 'bun:test';
import { Core, System } from '../../core';
import { SystemGraph } from '../SystemGraph';

describe('SystemManager', () => {
	test('Add system to core', () => {
		const core = new Core();
		const sm = core.add(new SystemGraph(core));

		const [added] = core.get(SystemGraph);

		expect(added).toBe(sm);
	});
	test('Systems execute in correct order', async () => {
		const core = new Core();
		const sm = core.add(new SystemGraph(core));
		const order: string[] = [];

		class SystemA extends System {
			run(_: number) {
				order.push('A');
			}
		}

		class SystemB extends System {
			run(_: number) {
				order.push('B');
			}
		}

		class SystemC extends System {
			run(_: number) {
				order.push('C');
			}
		}

		const systemA = new SystemA();
		const systemB = new SystemB();
		const systemC = new SystemC();

		sm.addSystem(systemA);
		sm.addSystem(systemB);
		sm.addSystem(systemC);

		// Setting up dependencies: A -> B -> C
		sm.addDependency(systemA, systemB);
		sm.addDependency(systemB, systemC);

		sm.run(0);

		expect(order).toEqual(['C', 'B', 'A']);
	});

	test('Handles multiple independent systems', async () => {
		const core = new Core();
		const sm = new SystemGraph(core);
		const order: string[] = [];

		class SystemA extends System {
			run(_: number) {
				order.push('A');
			}
		}

		class SystemB extends System {
			run(_: number) {
				order.push('B');
			}
		}

		class SystemC extends System {
			run(_: number) {
				order.push('C');
			}
		}

		const systemA = new SystemA();
		const systemB = new SystemB();
		const systemC = new SystemC();

		sm.addSystem(systemA);
		sm.addSystem(systemB);
		sm.addSystem(systemC);

		sm.run(0);

		expect(order).toEqual(expect.arrayContaining(['A', 'B', 'C']));
	});

	test('Cycles in dependencies throw error', () => {
		const core = new Core();
		const sm = new SystemGraph(core);

		class SystemA extends System {
			run(_: number) {}
		}

		class SystemB extends System {
			run(_: number) {}
		}

		const systemA = new SystemA();
		const systemB = new SystemB();

		sm.addSystem(systemA);
		sm.addSystem(systemB);

		// Creating a cyclic dependency: A -> B -> A
		sm.addDependency(systemA, systemB);
		sm.addDependency(systemB, systemA);

		expect(() => sm.run(0)).toThrow('Cycle detected in dependency graph');
	});
});
