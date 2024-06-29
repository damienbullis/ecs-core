import { System } from '../core';
import { EntityManager } from './EntityManager';
import { CanvasComponent } from './EntityManager/components';

/**
 * System to initialize the Canvas.
 *
 * - creates the canvas element & context
 * - Adds the canvas component to the entity manager
 *
 * @requires EntityManager
 * @requires Browser
 */
export class Canvas extends System {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;

	constructor(entityManager: EntityManager) {
		super();
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

		entityManager.addComponent(
			entityManager.createEntity(),
			new CanvasComponent(this.canvas),
		);

		document.body.appendChild(this.canvas);
		window.addEventListener('resize', this.resize.bind(this));
		this.resize();
	}

	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	run() {
		// Clear the canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
