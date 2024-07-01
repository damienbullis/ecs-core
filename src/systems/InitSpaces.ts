import { System } from '../core';
import { EntityAdapter, PlayerEntityState, SpaceState } from './EntityAdapter';

const INIT_SIZE = 14;

/**
 * System to initialize spaces.
 * - creates the spaces for the game
 * - sets the initial state of the spaces
 * - add locations to players & players to locations
 */
export class InitSpaces extends System {
	constructor(entityAdapter: EntityAdapter, ...players: number[]) {
		super();

		const playerEntities = players.map((p) =>
			entityAdapter.get(p, PlayerEntityState),
		);

		let playerCount = 1;
		const distance = Math.floor((INIT_SIZE - players.length) / 3);
		for (let i = 0; i < INIT_SIZE; i++) {
			const s = entityAdapter.create();
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
			entityAdapter.add(s, space);
		}
	}

	run() {}
}
