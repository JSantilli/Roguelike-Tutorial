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

const itemWeightsByFloor = [
	{
		floor: 0, weights: [
			{ value: "Health Potion", weight: 35 }
		]
	},
	{
		floor: 2, weights: [
			{ value: "Confusion Scroll", weight: 10 }
		]
	},
	{
		floor: 4, weights: [
			{ value: "Lightning Scroll", weight: 25 }
		]
	},
	{
		floor: 6, weights: [
			{ value: "Fireball Scroll", weight: 25 }
		]
	}
];

const monsterWeightsByFloor = [
	{
		floor: 0, weights: [
			{ value: "orc", weight: 80 }
		]
	},
	{
		floor: 3, weights: [
			{ value: "troll", weight: 15 }
		]
	},
	{
		floor: 5, weights: [
			{ value: "troll", weight: 30 }
		]
	},
	{
		floor: 7, weights: [
			{ value: "troll", weight: 60 }
		]
	}
];

function getMaxValueForFloor(maxValueByFloorList, currentFloor) {

	let currentValue = 0;

	for (let {floor, value} of maxValueByFloorList) {
		if (floor > currentFloor) {
			break;
		} else {
			currentValue = value;
		}
	}

	return currentValue;
}

function getWeightedSpawnsForFloor(weightsByFloorList, currentFloor) {

	const currentWeights = {};

	for (let {floor, weights} of weightsByFloorList) {
		if (floor > currentFloor) {
			break;
		} else {
			for (let {value, weight} of weights) {
				currentWeights[value] = weight;
			}
		}
	}

	return currentWeights;
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

	scheduler.clear();

	const maxMonstersPerRoom = getMaxValueForFloor(maxMonstersByFloor, floorNumber);
	const maxItemsPerRoom = getMaxValueForFloor(maxItemsByFloor, floorNumber);

	const monsterWeights = getWeightedSpawnsForFloor(monsterWeightsByFloor, floorNumber);
	const itemWeights = getWeightedSpawnsForFloor(itemWeightsByFloor, floorNumber);

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

				const monsterString = ROT.RNG.getWeightedValue(monsterWeights);
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

				const itemString = ROT.RNG.getWeightedValue(itemWeights);
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
