import { expect, describe, test } from 'bun:test';
import { InitSpaces } from '.';
import { ECSCore } from '../core';
import { PlayerEntityState, SpaceState } from '../components';

describe('InitSpaces', () => {
	const ecs = new ECSCore();
	const player = ecs.createEntity();

	ecs.addComponent(player, new PlayerEntityState({ teamId: 0, id: player }));
	const ai = ecs.createEntity();
	ecs.addComponent(ai, new PlayerEntityState({ teamId: 1, id: ai }));

	const initSpaces = new InitSpaces(ecs, player, ai);
	ecs.addSystem(initSpaces);

	const playerState = ecs.getComponent(player, PlayerEntityState);
	const aiState = ecs.getComponent(ai, PlayerEntityState);

	test('Can add system to core', () => {
		const systems = ecs.getSystem(InitSpaces);
		expect(systems).toBe(initSpaces);
	});

	test('Players have correct starting locations', () => {
		expect(playerState?.location).toBe(5);
		expect(aiState?.location).toBe(9);
	});

	test('Spaces with entities have correct locations', () => {
		const spaces = ecs
			.getEntitiesWithComponents(SpaceState)
			.map((s) => ecs.getComponent(s, SpaceState));
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
