'use strict';

import { Color } from "./color.js";
import { Glyph } from "./glyph.js";

export class Tile extends Glyph {

	walkable;
	transparent;

	constructor({
		walkable = false,
		transparent = false,
		...properties
	} = {}) {
		
		super(properties);

		this.walkable = walkable;
		this.transparent = transparent;
	}
}

Tile.nullTile = new Tile();

Tile.floorTile = new Tile({
	character: ' ',
	foreground: new Color(255, 255, 255),
	background: new Color(50, 50, 150),
	walkable: true,
	transparent: true,
	hasDarkGlyph: false
});

Tile.wallTile = new Tile({
	character: ' ',
	foreground: new Color(255, 255, 255),
	background: new Color(0, 0, 100),
	walkable: false,
	transparent: false,
	hasDarkGlyph: false
});
