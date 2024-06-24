import { describe, expect, test, jest } from 'bun:test';
import { EventBus } from '.';
import { ECSCore } from '../core';

describe('EventBus', () => {
	const ecs = new ECSCore();
	const eventBus = new EventBus(ecs);

	test('Can add system to core', () => {
		ecs.addSystem(eventBus);
		const systems = ecs.getSystem(EventBus);
		expect(systems).toBe(eventBus);
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
