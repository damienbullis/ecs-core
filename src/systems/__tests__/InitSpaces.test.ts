import { expect, describe, test } from 'bun:test';
import { Core } from '../../core';
import { EntityManager } from '../EntityManager';
import { PlayerEntityState, SpaceState } from '../EntityManager/components';
import { InitSpaces } from '../InitSpaces';

describe('InitSpaces', () => {
	const core = new Core();
	const em = core.add(new EntityManager(core));
	const player = em.createEntity();

	em.addComponent(player, new PlayerEntityState({ teamId: 0, id: player }));
	const ai = em.createEntity();
	em.addComponent(ai, new PlayerEntityState({ teamId: 1, id: ai }));

	const initSpaces = core.add(new InitSpaces(core, em, player, ai));

	const playerState = em.getComponent(player, PlayerEntityState);
	const aiState = em.getComponent(ai, PlayerEntityState);

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
