import { expect, test, describe } from 'bun:test';

import { Core, System } from '.';

const S = class extends System {
	run() {}
};
describe('ECS Core', () => {
	test('Add system', () => {
		const core = new Core();
		const system = core.add(new S());
		const [added] = core.get(S);

		expect(added).toBe(system);
	});

	test('Get systems', () => {
		const core = new Core();
		const s = core.add(new S());
		const [added] = core.get(S);

		expect(added).toBe(s);
	});
});
