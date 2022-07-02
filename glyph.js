'use strict';

import { Color } from "./color.js";

export class Glyph {

	character;
	foreground;
	background;
	darkGlyph;

	constructor({
		character = ' ',
		foreground = new Color(0, 0, 0),
		background = new Color(0, 0, 0),
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
	foreground: new Color(191, 0, 0),
	background: new Color(200, 180, 50)
});
