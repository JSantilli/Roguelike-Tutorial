'use strict';

import { Colors } from "./colors.js";
import { Glyph } from "./glyph.js";

export class Tile {

	walkable;
	transparent;

	glyph;

	constructor({
		walkable = false,
		transparent = false,
		glyphProperties = {}
	} = {}) {

		this.walkable = walkable;
		this.transparent = transparent;

		this.glyph = new Glyph(glyphProperties);
	}
}

Tile.NullTile = new Tile();

Tile.FloorTile = new Tile({
	glyphProperties: {
		character: ' ',
		foreground: Colors.TileFloorFG,
		background: Colors.TileFloorBG,
		hasDarkGlyph: true,
		darkProperties: {
			foreground: Colors.TileFloorDarkFG,
			background: Colors.TileFloorDarkBG
		}
	},
	walkable: true,
	transparent: true
});

Tile.WallTile = new Tile({
	glyphProperties: {
		character: ' ',
		foreground: Colors.TileWallFG,
		background: Colors.TileWallBG,
		hasDarkGlyph: true,
		darkProperties: {
			foreground: Colors.TileWallDarkFG,
			background: Colors.TileWallDarkBG
		}
	},
	walkable: false,
	transparent: false
});

Tile.DownStairsTile = new Tile({
	glyphProperties: {
		character: '>',
		foreground: Colors.TileDownStairsFG,
		background: Colors.TileDownStairsBG,
		hasDarkGlyph: true,
		darkProperties: {
			foreground: Colors.TileDownStairsDarkFG,
			background: Colors.TileDownStairsDarkBG
		}
	},
	walkable: true,
	transparent: true
});
