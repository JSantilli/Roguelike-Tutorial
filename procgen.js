'use strict';

import { Map } from "./map.js";
import { Tile } from "./tile.js";

// TODO: This shouldn't just export functions like this
// Instead, export a static style class maybe?
// Right now you just have some random call to a function called generateDungeon and placeEntities
// and you have to go to the import statement to understand where those functions are defined
// bad namespacing, bad for understanding why you would use that function

const maxItemsByFloor = [
	{floor: 1, value: 1},
	{floor: 4, value: 2}
];

const maxMonstersByFloor = [
	{floor: 1, value: 2},
	{floor: 4, value: 3},
	{floor: 6, value: 5}
];

function getMaxValueForFloor(maxValueByFloorList, floor) {

	let currentValue = 0;

	for (let {floorMinimum, value} of maxValueByFloorList) {
		if (floorMinimum > floor) {
			break;
		} else {
			currentValue = value;
		}
	}

	return currentValue;
}

export function generateDungeon(mapWidth, mapHeight, roomMinSize, roomMaxSize) {

	const diggerOptions = {
		roomWidth: [roomMinSize, roomMaxSize],
		roomHeight: [roomMinSize, roomMaxSize],
	};

	const digger = new ROT.Map.Digger(mapWidth, mapHeight, diggerOptions);

	const map = new Map(mapWidth, mapHeight, digger);

	map.digger.create((x, y, value) => {
		if (value === 0) {
			map.tiles[x][y] = Tile.FloorTile;
		}
	});

	const lastRoom = map.digger.getRooms()[map.digger.getRooms().length - 1];
	const [downStairsX, downStairsY] = lastRoom.getCenter();
	map.tiles[downStairsX][downStairsY] = Tile.DownStairsTile;

	return map;
}

export function placeEntities(map, floorNumber, entityFactory, scheduler) {

	const maxMonstersPerRoom = getMaxValueForFloor(maxMonstersByFloor, floorNumber);
	const maxItemsPerRoom = getMaxValueForFloor(maxItemsByFloor, floorNumber);

	const monsters = { // TODO: I probably want to create this weighted list from the entity factory list
		"orc": 80,
		"troll": 20
	};

	const items = {
		"Health Potion": 70,
		"Fireball Scroll": 10,
		"Confusion Scroll": 10,
		"Lightning Scroll": 10
	};

	for (let i = 0; i < map.digger.getRooms().length; i++) {
		const room = map.digger.getRooms()[i];

		if (i === 0) {
			const [playerX, playerY] = room.getCenter();

			const player = map.game.player;
			player.setPosition(playerX, playerY, map);
			map.setPlayer(player);
			scheduler.add(player, true);
		} else {
			const numberOfMonsters = getRandomInt(0, maxMonstersPerRoom);

			for (let j = 0; j < numberOfMonsters; j++) {

				let x, y;
				do {
					x = getRandomInt(room.getLeft() + 1, room.getRight() - 1);
					y = getRandomInt(room.getTop() + 1, room.getBottom() - 1);
				} while (!map.isEmptyTile(x, y));

				const monsterString = ROT.RNG.getWeightedValue(monsters);
				const monster = entityFactory.create(monsterString, map, x, y);
				scheduler.add(monster, true); // TODO: should the factory create method do this?
			}

			const numberOfItems = getRandomInt(0, maxItemsPerRoom);

			for (let k = 0; k < numberOfItems; k++) {

				let x, y;
				do {
					x = getRandomInt(room.getLeft() + 1, room.getRight() - 1);
					y = getRandomInt(room.getTop() + 1, room.getBottom() - 1);
				} while (!map.isEmptyTile(x, y));

				const itemString = ROT.RNG.getWeightedValue(items);
				entityFactory.create(itemString, map, x, y);
			}
		}
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(ROT.RNG.getUniform() * (max - min + 1) + min);
}
