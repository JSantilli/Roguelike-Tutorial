'use strict';

import { generateDungeon, placeEntities } from "./procgen.js";

export class World {

	mapWidth;
	mapHeight;

	roomMinSize;
	roomMaxSize;
	
	maxMonstersPerRoom;
	maxItemsPerRoom;

	currentFloor;

	constructor(
		game,
		mapWidth,
		mapHeight,
		roomMinSize,
		roomMaxSize,
		maxMonstersPerRoom,
		maxItemsPerRoom,
		currentFloor = 0
	) {

		this.game = game;

		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;

		this.roomMinSize = roomMinSize;
		this.roomMaxSize = roomMaxSize;

		this.maxMonstersPerRoom = maxMonstersPerRoom;
		this.maxItemsPerRoom = maxItemsPerRoom;

		this.currentFloor = currentFloor;
	}

	generateFloor() {

		this.currentFloor += 1;

		this.game.map = generateDungeon(this.mapWidth, this.mapHeight, this.roomMinSize, this.roomMaxSize);
		this.game.map.setGame(this.game);

		if (!this.game.player) {
			this.game.player = this.game.entityFactory.create("player", this.game.map, -1, -1);
		}

		placeEntities(this.game.map, this.maxMonstersPerRoom, this.maxItemsPerRoom, this.game.entityFactory, this.game.scheduler);
	}
}
