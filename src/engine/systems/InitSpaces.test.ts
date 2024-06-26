import { expect, describe, test } from 'bun:test';
import { EntityManager, InitSpaces } from '.';
import { Core } from '../core';
import { PlayerEntityState, SpaceState } from '../components';

describe('InitSpaces', () => {
	const core = new Core();
	const em = new EntityManager(core);
	const player = em.createEntity();

	em.addComponent(player, new PlayerEntityState({ teamId: 0, id: player }));
	const ai = em.createEntity();
	em.addComponent(ai, new PlayerEntityState({ teamId: 1, id: ai }));

	const initSpaces = new InitSpaces(core, em, player, ai);
	core.addSystem(initSpaces);

	const playerState = em.getComponent(player, PlayerEntityState);
	const aiState = em.getComponent(ai, PlayerEntityState);

	test('Can add system to core', () => {
		const systems = core.getSystem(InitSpaces);
		expect(systems).toBe(initSpaces);
	});

	test('Players have correct starting locations', () => {
		expect(playerState?.location).toBe(5);
		expect(aiState?.location).toBe(9);
	});

	test('Spaces with entities have correct locations', () => {
		const spaces = em
			.getEntitiesWithComponents(SpaceState)
			.map((s) => em.getComponent(s, SpaceState));
		const playerLocation = spaces.find((s) =>
			s?.entities.includes(player),
		)?.location;
		expect(playerLocation).toBe(playerState?.location!);
		const aiLocation = spaces.find((s) =>
			s?.entities.includes(ai),
		)?.location;
		expect(aiLocation).toBe(aiState?.location!);
	});
});
