'use strict';

import { Tile } from "./tile.js";

export class Map {

	width;
	height;
	tiles;

	explored;

	player;
	entities;

	fov;

	constructor(width, height, player, entities) {
		this.width = width;
		this.height = height;

		[this.tiles, this.explored] = this.generateMap(this.width, this.height);

		this.player = player;
		this.entities = entities;

		this.fov = new ROT.FOV.PreciseShadowcasting(function(x, y) {
			return this.getTile(x, y).transparent;
		}.bind(this));
	}

	generateMap(width, height) {
		let tiles = this.createFilled2DArray(width, height, Tile.wallTile);
		let explored = {};

		return [tiles, explored];
	}

	getTile(x, y) {
		if (!this.isInBounds(x, y)) {
			return Tile.nullTile;
		} else {
			return this.tiles[x][y] || Tile.nullTile;
		}
	}

	isExplored(x, y) {
		if (this.getTile(x, y) !== Tile.nullTile) {
			return this.explored[x + "," + y];
		} else {
			return false;
		}
		
	}

	setExplored(x, y, explored) {
		if (this.getTile(x, y) !== Tile.nullTile) {
			this.explored[x + "," + y] = explored;
		}
	}

	isInBounds(x, y) {
		return (x >= 0 && x < this.width && y >= 0 && y < this.height);
	}

	getEntityAt(x, y) {
		for (let entity of this.entities) {
			if (entity.x == x && entity.y == y) {
				return entity;
			}
		}
		return null;
	}

	render(display) {

		let visibleCells = {};

		this.fov.compute(this.player.x, this.player.y, 8, function(x, y, r, visibility) {
			visibleCells[x + "," + y] = true
			this.setExplored(x, y, true);
		}.bind(this));

		for (let x = 0; x < this.tiles.length; x++) {
			const column = this.tiles[x];
			for (let y = 0; y < column.length; y++) {
				if (this.isExplored(x, y)) {
					let tile = this.getTile(x, y);
					let glyph = tile.glyph;
					if (!visibleCells[x + "," + y]) {
						if (glyph.darkGlyph) {
							glyph = glyph.darkGlyph;
						}
					} else {
						if (this.getEntityAt(x, y)) {
							glyph = this.getEntityAt(x, y).glyph;
						}
					}
					display.draw(x, y, glyph.character, glyph.foreground.colorStr, glyph.background.colorStr);
				}
			}
		}
	}

	createFilled2DArray(width, height, fillValue) {
		return Array.from(Array(width), () => new Array(height).fill(fillValue));
	}

}
