'use strict';

import { Tile } from "./tile.js";

/* 

TODO:
Maybe Map should also be in charge of entity creation.

Rather than the game calling into procgen, map does.
Map generates the dungeons (or loads one in, or whatever)
Map defines what entities are relevant for the map and therefore owns the factory
Map creates those entities and places them (in the map)

*/

export class Map {

	width;
	height;
	tiles;

	explored;

	digger;

	game;

	player;
	entities;

	fov;

	constructor(width, height, digger) {
		this.width = width;
		this.height = height;

		this.tiles = this.generateMap(this.width, this.height);
		this.explored = {};
		this.visible = {};

		this.digger = digger;

		this.entities = {};

		this.fov = new ROT.FOV.PreciseShadowcasting(function(x, y) {
			return this.getTile(x, y).transparent;
		}.bind(this), {topology: 8});
	}

	setGame(game) {
		this.game = game;
	}

	setPlayer(player) {
		this.player = player;
	}

	generateMap(width, height) {
		const tiles = this.createFilled2DArray(width, height, Tile.wallTile);

		return tiles;
	}

	getTile(x, y) {
		if (!this.isTileInBounds(x, y)) {
			return Tile.nullTile;
		} else {
			return this.tiles[x][y] || Tile.nullTile;
		}
	}

	isTileExplored(x, y) {
		if (this.getTile(x, y) !== Tile.nullTile) {
			return this.explored[x + "," + y];
		} else {
			return false;
		}
		
	}

	setTileExplored(x, y, explored) {
		if (this.getTile(x, y) !== Tile.nullTile) {
			this.explored[x + "," + y] = explored;
		}
	}

	isTileVisible(x, y) {
		return this.visible[x + "," + y];
	}

	setTileVisible(x, y, visible) {
		this.visible[x + "," + y] = visible;
	}

	isTileWalkable(x, y) {
		return this.getTile(x, y).walkable;
	}

	isTileInBounds(x, y) {
		return (x >= 0 && x < this.width && y >= 0 && y < this.height);
	}

	getEntityAt(x, y) {
		return this.entities[x + "," + y];
	}

	addEntity(entity) {
		this.addEntityAt(entity, entity.x, entity.y);
	}

	addEntityAt(entity, x, y) {
		entity.x = x;
		entity.y = y;
		const key = entity.x + "," + entity.y;
		this.entities[key] = entity;
	}

	// BUG: Currently only one entity can exist in a tile at a time
	updateEntityPosition(entity, oldX, oldY) {
		delete this.entities[oldX + "," + oldY];

		if (this.isTileInBounds(entity.x, entity.y)) {
			if (this.isEmptyTile(entity.x, entity.y)) {
				this.addEntity(entity);
			}
		}
	}

	isEmptyTile(x, y) {
		return !this.getEntityAt(x, y);
	}

	getBlockingEntity(x, y) {
		const entity = this.getEntityAt(x, y);
		if (entity && entity.blocksMovement) {
			return entity;
		} else {
			return null;
		}
	}

	render(display) {

		// TODO: it would be cool to somehow remove the player reference from this
		// 	Maybe have a list of 'fov entities' that each have their fov computed each render
		//	Could be interesting for having an fov of a security camera or something like it

		this.visible = {};

		this.fov.compute(this.player.x, this.player.y, 8, function(x, y, r, visibility) {
			this.setTileVisible(x, y, true);
			this.setTileExplored(x, y, true);
		}.bind(this));

		for (let x = 0; x < this.tiles.length; x++) {
			const column = this.tiles[x];
			for (let y = 0; y < column.length; y++) {
				if (this.isTileExplored(x, y)) {
					const tile = this.getTile(x, y);
					let glyph = tile.glyph;
					if (!this.isTileVisible(x, y)) {
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
