import { System } from '../core';

export class EventBus extends System {
	private channels: { [key: string]: ((data?: any) => void)[] } = {};

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

	run(): void {}
}
