
import { Map } from "./map.js";
import { Tile } from "./tile.js";

// class RectangularRoom {

// 	x1;
// 	x2;
// 	y1;
// 	y2;

// 	constructor(x, y, width, height) {
// 		this.x1 = x;
// 		this.x2 = x + width;
// 		this.y1 = y;
// 		this.y2 = y + height;
// 	}

// 	getCenter() {
// 		const center_x = Math.floor((this.x1 + this.x2) / 2);
// 		const center_y = Math.floor((this.y1 + this.y2) / 2);

// 		return [center_x, center_y];
// 	}

// 	getInner() {
// 		let innerIndexes = [];

// 		for (let x = this.x1 + 1; x < this.x2; x++) {
// 			for (let y = this.y1 + 1; y < this.y2; y++) {
// 				innerIndexes.push([x, y]);
// 			}
// 		}

// 		return innerIndexes;
// 	}
// }

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

// function cutOutRoom(map, room) {
// 	room.getInner().forEach(tileIndex => {
// 		map.tiles[tileIndex[1]][tileIndex[0]] = Tile.floorTile;
// 	});
// }
