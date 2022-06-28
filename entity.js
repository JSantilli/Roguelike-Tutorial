'use strict';

import { Glyph } from "./glyph.js";

export class Entity {

	name;

	x;
	y;

	blocksMovement;
	
	glyph;

	map;

	mixins;

	// actFunction;

	constructor({
		name = "<Unnamed>",
		character = "?",
		foreground,
		background,
		blocksMovement = false,
		map,
		mixins = []

	} = {}) {

		this.name = name;

		this.blocksMovement = blocksMovement;

		this.glyph = new Glyph({
			character: character,
			foreground: foreground,
			background: background
		});

		this.map = map;

		mixins.forEach(mixin => {
			for (const key in mixin) {
				if (key !== 'name') {
					this[key] = mixin[key];
				}
			}
		});
	}

	setPosition(x, y) {
		let oldX = this.x;
		let oldY = this.y;

		this.x = x;
		this.y = y;

		if (this.map) {
			this.map.updateEntityPosition(this, oldX, oldY);
		}
	}
}
