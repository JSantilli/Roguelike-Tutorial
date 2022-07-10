'use strict';

import { Colors } from "./colors.js";

export class Glyph {

	character;
	foreground;
	background;
	darkGlyph;

	constructor({
		character = ' ',
		foreground = Colors.Black,
		background = Colors.Black,
		hasDarkGlyph = false,
		darkGlyph = null,
		darkProperties = {},
	} = {}) {

		this.character = character;
		this.foreground = foreground;
		this.background = background;
		this.darkGlyph = darkGlyph;

		if (hasDarkGlyph && darkGlyph === null) {
			this.darkGlyph = new Glyph({...darkProperties, hasDarkGlyph: false});
		}
	}
}

Glyph.corpseGlyph = new Glyph({
	character: "%",
	foreground: Colors.Corpse,
	background: Colors.CorpseBG
});
