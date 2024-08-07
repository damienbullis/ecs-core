import { describe, expect, test, jest } from 'bun:test';
import { Core } from '../../core';
import { EventBus } from '../EventBus';

describe('EventBus', () => {
	const core = new Core();
	const eventBus = core.add(new EventBus());

	test('Can add system to core', () => {
		const systems = core.get(EventBus);
		expect(systems).toEqual([eventBus]);
	});

	const fn = jest.fn();
	test('Can add event listener', () => {
		eventBus.subscribe('test', fn);

		eventBus.publish('test', { test: 'data' });

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith({ test: 'data' });
	});

	test('Can remove event listener', () => {
		eventBus.unsubscribe('test', fn);
		fn.mockClear(); // Resets the mock call count

		eventBus.publish('test', { test: 'data' });
		expect(fn).not.toHaveBeenCalledTimes(1);
		expect(fn).not.toHaveBeenCalledWith({ test: 'data' });
	});
});
