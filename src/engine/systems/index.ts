import { CanvasComponent, PlayerEntityState, SpaceState } from '../components';
import type { Entity, Core } from '../core';
import { System } from '../core';

const INIT_SIZE = 14;

/**
 * System to initialize spaces.
 * - creates the spaces for the game
 * - sets the initial state of the spaces
 * - add locations to players & players to locations
 */
export class InitSpaces extends System {
	constructor(ecs: Core, ...players: Entity[]) {
		super(ecs);

		const playerEntities = players.map((p) =>
			ecs.getComponent(p, PlayerEntityState),
		);

		let playerCount = 1;
		const distance = Math.floor((INIT_SIZE - players.length) / 3);
		for (let i = 0; i < INIT_SIZE; i++) {
			const s = ecs.createEntity();
			const space = new SpaceState();
			if (
				playerCount * distance + players.length / 2 === i &&
				playerCount <= players.length
			) {
				// add space to player
				playerEntities[playerCount - 1]!.location = i;

				// add player to space
				space.entities.push(playerCount - 1);

				playerCount++;
			}
			// set the initial state of the spaces
			space.id = s;
			space.location = i;
			ecs.addComponent(s, space);
		}
	}

	update() {}
}

export class EventBus extends System {
	private channels: { [key: string]: ((data?: any) => void)[] } = {};

	constructor(ecs: Core) {
		super(ecs);
	}

	/**
	 * Publish an event to a channel.
	 * @param channel - The event type to publish.
	 * @param data - The data to send with the event.
	 */
	publish(channel: string, data?: any) {
		if (!this.channels[channel]) return;
		this.channels[channel].forEach((callback) => callback(data));
	}

	/**
	 * Subscribe to an event channel.
	 * @param channel - The event type to subscribe to.
	 * @param callback - The function to call when the event is published.
	 */
	subscribe(channel: string, callback: (data?: any) => void) {
		if (!this.channels[channel]) {
			this.channels[channel] = [];
		}
		this.channels[channel].push(callback);
	}

	/**
	 * Unsubscribe from an event channel.
	 * @param channel - The event type to unsubscribe from.
	 * @param callback - The function to remove from the subscription list.
	 */
	unsubscribe(channel: string, callback: (data?: any) => void) {
		if (!this.channels[channel]) return;
		this.channels[channel] = this.channels[channel].filter(
			(cb) => cb !== callback,
		);
	}

	update(): void {}
}

export class Canvas extends System {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;

	constructor(ecs: Core) {
		super(ecs);
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		ecs.addComponent(ecs.createEntity(), new CanvasComponent(this.canvas));

		document.body.appendChild(this.canvas);
		window.addEventListener('resize', this.resize.bind(this));
		this.resize();
	}

	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	update(_: number) {
		// Clear the canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
