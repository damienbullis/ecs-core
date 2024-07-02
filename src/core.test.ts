import { expect, test, describe } from 'bun:test';

import { Core, System } from './core';

describe('ECS Core', () => {
	const TestSystem = class extends System {
		run() {}
	};
	const TestSystem2 = class extends System {
		run() {}
	};
	test('Add system', () => {
		const core = new Core();
		const system = core.add(new TestSystem());
		const [added] = core.get(TestSystem);

		expect(added).toBe(system);
	});

	test('Get systems', () => {
		const core = new Core();
		core.add(new TestSystem());
		core.add(new TestSystem());
		core.add(new TestSystem2());
		const systems = core.get(TestSystem);
		const system2 = core.get(TestSystem2);

		expect(systems.length).toBe(2);
		expect(system2.length).toBe(1);
	});
});
