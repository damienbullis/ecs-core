import { Component } from '../';

export class TurnCount implements Component {
	turnCount = 0;
}

export class PlayerEntityState implements Component {
	id = 0;
	teamId = 0;
	location = 0; // spaceId
	x = 0;
	y = 0;
	width = 0;
	height = 0;
	timerMax = 30;
	actionQueued = false;
	constructor({ teamId, id }: { teamId: number; id: number }) {
		this.teamId = teamId;
		this.id = id;
	}
}

export class SpaceState implements Component {
	id = 0;
	location = 0;
	entities: number[] = [];
	x: number = 0;
	y: number = 0;
	width: number = 0;
	height: number = 0;
	status: string[] = [];
	occupied: boolean = false;
}

export class CanvasComponent implements Component {
	element: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.element = canvas;
		this.context = canvas.getContext('2d')!;
	}
}
