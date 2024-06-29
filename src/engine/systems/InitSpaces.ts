import { Core, System } from '../core';
import { EntityManager } from './EntityManager';
import { PlayerEntityState, SpaceState } from './EntityManager/components';

const INIT_SIZE = 14;

/**
 * System to initialize spaces.
 * - creates the spaces for the game
 * - sets the initial state of the spaces
 * - add locations to players & players to locations
 */
export class InitSpaces extends System {
	constructor(ecs: Core, em: EntityManager, ...players: number[]) {
		super(ecs);

		const playerEntities = players.map((p) =>
			em.getComponent(p, PlayerEntityState),
		);

		let playerCount = 1;
		const distance = Math.floor((INIT_SIZE - players.length) / 3);
		for (let i = 0; i < INIT_SIZE; i++) {
			const s = em.createEntity();
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
			em.addComponent(s, space);
		}
	}

	run() {}
}
