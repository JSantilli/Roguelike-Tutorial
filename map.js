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
	visible;

	digger;

	game;

	player;
	entities;

	fov;

	constructor(width, height, digger = null) {

		this.width = width;
		this.height = height;

		this.tiles = this.generateMap(this.width, this.height);
		this.explored = {};
		this.visible = {};
		// TODO: ^ this.visible only needs to be an instance variable on map because we use the player's vision as the monsters' vision when pathfinding.
		// Shouldn't need this to exist except in the render method once monster fov is implemented separately.
		// this.fov already exists, so we should be able to compute the moster fov in the proper mixin, perhaps with some new helper functions here.

		this.digger = digger;

		this.entities = {};

		this.fov = new ROT.FOV.PreciseShadowcasting(function (x, y) {
			return this.getTile(x, y).transparent;
		}.bind(this), { topology: 8 });
	}

	setGame(game) {

		this.game = game;
	}

	setPlayer(player) {

		this.player = player;
	}

	generateMap(width, height) {

		const tiles = this.createFilled2DArray(width, height, Tile.WallTile);

		return tiles;
	}

	getTile(x, y) {

		if (!this.isTileInBounds(x, y)) {
			return Tile.NullTile;
		} else {
			return this.tiles[x][y] || Tile.NullTile;
		}
	}

	isTileExplored(x, y) {

		if (this.getTile(x, y) !== Tile.NullTile) {
			return this.explored[x + "," + y];
		} else {
			return false;
		}

	}

	setTileExplored(x, y, explored) {

		if (this.getTile(x, y) !== Tile.NullTile) {
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

	getAllEntities() {

		const entities = [];
		for (const [, entitySet] of Object.entries(this.entities)) {
			if (entitySet && entitySet.size > 0) {
				entities.push(...Array.from(entitySet));
			}
		}

		if (entities.length > 0) {
			return entities;
		} else {
			return null;
		}
	}

	getEntitiesAt(x, y) {

		const entities = this.entities[x + "," + y];
		if (entities && entities.size > 0) {
			return Array.from(entities);
		} else {
			return null;
		}
	}

	addEntity(entity) {

		const key = entity.x + "," + entity.y;
		if (this.entities[key]) {
			this.entities[key].add(entity);
		} else {
			this.entities[key] = new Set([entity]);
		}
	}

	removeEntity(entity, previousX = null, previousY = null) {

		let x = entity.x;
		let y = entity.y;
		if (previousX !== null && previousY !== null) {
			x = previousX;
			y = previousY;
		}

		const key = x + "," + y;
		const entitiesAtKey = this.entities[key];
		if (entitiesAtKey) {
			entitiesAtKey.delete(entity);
			if (entitiesAtKey.size === 0) {
				delete this.entities[key];
			}
		}
	}

	updateEntityPosition(entity, previousX, previousY) {

		this.removeEntity(entity, previousX, previousY);

		if (this.isTileInBounds(entity.x, entity.y)) {
			this.addEntity(entity);
		}
	}

	isEmptyTile(x, y) {

		return !this.getEntitiesAt(x, y);
	}

	getBlockingEntities(x, y) {

		const entities = this.getEntitiesAt(x, y);
		if (entities) {
			const blockingEntities = entities.filter(entity => entity.blocksMovement);
			if (blockingEntities.length > 0) {
				return blockingEntities;
			}
		}

		return null;
	}

	getItemsAt(x, y) {

		const entities = this.getEntitiesAt(x, y);
		if (entities) {
			const items = entities.filter(entity => entity.hasGroup("Item"));
			if (items.length > 0) {
				return items;
			}
		}

		return null;
	}

	// getActorsAt(x, y) {

	// 	const entities = this.getEntitiesAt(x, y);
	// 	if (entities) {
	// 		const actors = entities.filter(entity => entity.hasGroup("Actor"));
	// 		if (actors.length > 0) {
	// 			return actors;
	// 		}
	// 	}

	// 	return null;
	// }

	render(display) {

		// TODO: it would be cool to somehow remove the player reference from this
		// 	Maybe have a list of 'fov entities' that each have their fov computed each render
		//	Could be interesting for having an fov of a security camera or something like it

		this.visible = {};

		this.fov.compute(this.player.x, this.player.y, 8, function (x, y, r, visibility) {
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
						if (this.getEntitiesAt(x, y)) {
							const entities = this.getEntitiesAt(x, y);
							entities.sort((a, b) => b.renderOrder - a.renderOrder);
							glyph = entities[0].glyph;
						}
					}
					display.draw(x, y, glyph.character, glyph.foreground, glyph.background);
				}
			}
		}
	}

	createFilled2DArray(width, height, fillValue) {
		return Array.from(Array(width), () => new Array(height).fill(fillValue));
	}

}
