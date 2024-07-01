import { describe, test, expect, jest } from 'bun:test';
import { Core } from '../../core';
import { SystemGraph } from '../SystemGraph';
import { EntityAdapter } from '../EntityAdapter';
import { Canvas } from '../Canvas';

// polyfill document and window
global.document = {
	//@ts-expect-error - jest.fn() is a mock function
	createElement: jest.fn(() => ({
		getContext: jest.fn(() => ({})),
	})),
	//@ts-expect-error - jest.fn() is a mock function
	body: {
		appendChild: jest.fn(),
	},
};

const addEventListener = jest.fn();

//@ts-expect-error - jest.fn() is a mock function
global.window = {
	addEventListener,
};

describe('Canvas', () => {
	const core = new Core();
	const sm = core.add(new SystemGraph(core));
	const em = sm.addSystem(new EntityAdapter());
	const canvas = sm.addSystem(new Canvas(em));

	test('Add canvas system to core', () => {
		expect(core.get(Canvas)[0]).toBe(canvas);
	});

	test('Creates a canvas element', () => {
		expect(document.createElement).toHaveBeenCalledWith('canvas');
		expect(document.body.appendChild).toHaveBeenCalled();
	});

	test('Resizes the canvas on mount', () => {
		expect(addEventListener).toHaveBeenCalled();
	});

	test('Updates the canvas system', () => {
		const [canvas] = core.get(Canvas);
		const update = jest.fn();

		//@ts-expect-error - jest.fn() is a mock function
		canvas.context.clearRect = update;

		sm.run(0);

		expect(update).toHaveBeenCalled();
	});
});
