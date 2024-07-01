import { expect, describe, test } from 'bun:test';
import { Core } from '../../core';
import { EntityAdapter, PlayerEntityState, SpaceState } from '../EntityAdapter';
import { InitSpaces } from '../InitSpaces';

describe('InitSpaces', () => {
	const core = new Core();
	const em = core.add(new EntityAdapter());
	const player = em.create();

	em.add(player, new PlayerEntityState({ teamId: 0, id: player }));
	const ai = em.create();
	em.add(ai, new PlayerEntityState({ teamId: 1, id: ai }));

	const initSpaces = core.add(new InitSpaces(em, player, ai));

	const playerState = em.get(player, PlayerEntityState);
	const aiState = em.get(ai, PlayerEntityState);

	test('Can add system to core', () => {
		const systems = core.get(InitSpaces);
		expect(systems.length).toBe(1);
		expect(systems).toEqual([initSpaces]);
	});

	test('Players have correct starting locations', () => {
		expect(playerState?.location).toBe(5);
		expect(aiState?.location).toBe(9);
	});

	test('Spaces with entities have correct locations', () => {
		const spaces = em.with(SpaceState).map((s) => em.get(s, SpaceState));
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
