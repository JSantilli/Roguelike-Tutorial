'use strict';

import { Tile } from "./tile.js";

export class Map {

	width;
	height;
	tiles;

	constructor(width, height) {
		this.width = width;
		this.height = height;

		this.tiles = this.generateMap(this.width, this.height);
	}

	generateMap(width, height) {
		let tiles = Array.from(Array(height), () => new Array(width).fill(Tile.wallTile));

		return tiles;
	}

	getTile(x, y) {
		if (!this.isInBounds(x, y)) {
			return Tile.nullTile;
		} else {
			return this.tiles[y][x] || Tile.nullTile;
		}
	}

	isInBounds(x, y) {
		return (x >= 0 && x < this.width && y >= 0 && y < this.height);
	}

	render(display) {
		for (let y = 0; y < this.tiles.length; y++) {
			const row = this.tiles[y];
			for (let x = 0; x < row.length; x++) {
				const tile = row[x];
				display.draw(x, y, tile.character, tile.foreground.colorStr, tile.background.colorStr);
			}
		}
	}

}
