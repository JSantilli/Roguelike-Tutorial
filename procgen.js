
import { Map } from "./map.js";
import { Tile } from "./tile.js";

export function generateDungeon(map_width, map_height) {
	
	const diggerOptions = {
		roomWidth: [6, 10],
		roomHeight: [6, 10],
	};

	const digger = new ROT.Map.Digger(map_width, map_height, diggerOptions);

	let map = new Map(map_width, map_height, digger);

	map.digger.create((x, y, value) => {
		if (value === 0) {
			map.tiles[x][y] = Tile.floorTile;
		}
	});

	return map;
}

export function placeEntities(map, maxMonstersPerRoom, entityFactory, scheduler) {

	const monsters = { // TODO: I probably want to create this weighted list from the entity factory list
		"orc": 80,
		"troll": 20
	};

	for (let i = 0; i < map.digger.getRooms().length; i++) {
		const room = map.digger.getRooms()[i];

		if (i === 0) {
			const [player_x, player_y] = room.getCenter();

			let player = entityFactory.create('player', player_x, player_y);
			map.setPlayer(player);
			scheduler.add(player, true);
		} else {
			let numberOfMonsters = getRandomInt(0, maxMonstersPerRoom);

			for (let j = 0; j < numberOfMonsters; j++) {

				let x, y;
				do {
					x = getRandomInt(room.getLeft() + 1, room.getRight() - 1);
					y = getRandomInt(room.getTop() + 1, room.getBottom() - 1);
				} while (!map.isEmptyTile(x, y));

				const monsterString = ROT.RNG.getWeightedValue(monsters);
				let monster = entityFactory.create(monsterString, x, y);
				scheduler.add(monster, true); // TODO: should the factory create method do this?
			}
		}
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(ROT.RNG.getUniform() * (max - min + 1) + min);
}
