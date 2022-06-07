'use strict';

import { Color } from "./color.js";
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

Tile.nullTile = new Tile();

Tile.floorTile = new Tile({
	glyphProperties: {
		character: ' ',
		foreground: new Color(255, 255, 255),
		background: new Color(200, 180, 50),
		hasDarkGlyph: true,
		darkProperties: {
			foreground: new Color(255, 255, 255),
			background: new Color(50, 50, 150)
		}
	},
	walkable: true,
	transparent: true
});

Tile.wallTile = new Tile({
	glyphProperties: {
		character: ' ',
		foreground: new Color(255, 255, 255),
		background: new Color(130, 110, 50),
		hasDarkGlyph: true,
		darkProperties: {
			foreground: new Color(255, 255, 255),
			background: new Color(0, 0, 100)
		}
	},
	walkable: false,
	transparent: false
});
