
import { Map } from "./map.js";
import { Tile } from "./tile.js";

export function generateDungeon(map_width, map_height) {
	
	let dungeon = new Map(map_width, map_height);

	const diggerOptions = {
		roomWidth: [6, 10],
		roomHeight: [6, 10],
	};

	let digger = new ROT.Map.Digger(map_width, map_height, diggerOptions);
	digger.create((x, y, value) => {
		if (value === 0) {
			dungeon.tiles[y][x] = Tile.floorTile;
		}
	});

	return dungeon;
}
