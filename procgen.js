
import { Map } from "./map.js";
import { Tile } from "./tile.js";

// TODO: This shouldn't just export functions like this
// Instead, export a static style class maybe?
// Right now you just have some random call to a function called generateDungeon and placeEntities
// and you have to go to the import statement to understand where those functions are defined
// bad namespacing, bad for understanding why you would use that function

export function generateDungeon(mapWidth, mapHeight) {

	const diggerOptions = {
		roomWidth: [6, 10],
		roomHeight: [6, 10],
	};

	const digger = new ROT.Map.Digger(mapWidth, mapHeight, diggerOptions);

	const map = new Map(mapWidth, mapHeight, digger);

	map.digger.create((x, y, value) => {
		if (value === 0) {
			map.tiles[x][y] = Tile.FloorTile;
		}
	});

	return map;
}

export function placeEntities(map, maxMonstersPerRoom, maxItemsPerRoom, entityFactory, scheduler) {

	const monsters = { // TODO: I probably want to create this weighted list from the entity factory list
		"orc": 80,
		"troll": 20
	};

	const items = {
		"Health Potion": 70,
		"Lightning Scroll": 30
	};

	for (let i = 0; i < map.digger.getRooms().length; i++) {
		const room = map.digger.getRooms()[i];

		if (i === 0) {
			const [playerX, playerY] = room.getCenter();

			const player = entityFactory.create("player", map, playerX, playerY);
			map.setPlayer(player);
			scheduler.add(player, true);

			scheduler.add(entityFactory.create("confused", map, playerX + 1, playerY + 1), true);
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
