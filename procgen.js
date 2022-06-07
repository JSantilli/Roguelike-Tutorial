
import { Map } from "./map.js";
import { Tile } from "./tile.js";

export function generateDungeon(map_width, map_height, player, entities) {
	
	let dungeon = new Map(map_width, map_height, player, entities);

	const diggerOptions = {
		roomWidth: [6, 10],
		roomHeight: [6, 10],
	};

	let digger = new ROT.Map.Digger(map_width, map_height, diggerOptions);
	digger.create((x, y, value) => {
		if (value === 0) {
			dungeon.tiles[x][y] = Tile.floorTile;
		}
	});

	return dungeon;
}
