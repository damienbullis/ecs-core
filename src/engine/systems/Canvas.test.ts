import { describe, test, expect, jest } from 'bun:test';
import { Canvas } from './';
import { Core } from '../core';

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
	const ecs = new Core();
	ecs.addSystem(new Canvas(ecs));

	test('Add canvas system to core', () => {
		expect(ecs.getSystem(Canvas)).toBeInstanceOf(Canvas);
	});

	test('Creates a canvas element', () => {
		expect(document.createElement).toHaveBeenCalledWith('canvas');
		expect(document.body.appendChild).toHaveBeenCalled();
	});

	test('Resizes the canvas on mount', () => {
		expect(addEventListener).toHaveBeenCalled();
	});

	test('Updates the canvas system', () => {
		const canvas = ecs.getSystem(Canvas) as Canvas;
		const update = jest.fn();

		//@ts-expect-error - jest.fn() is a mock function
		canvas.context.clearRect = update;

		ecs.update(0);

		expect(update).toHaveBeenCalled();
	});
});
