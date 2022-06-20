'use strict';

import { Glyph } from "./glyph.js";

export class Entity {

	name;

	x;
	y;

	blocksMovement;
	
	glyph;

	map;

	actFunction;

	constructor({
		name = "<Unnamed>",
		character = "?",
		foreground,
		background,
		blocksMovement = false,
		map,
		actFunction = () => {return;} // TODO: this needs to be a mixin instead

	} = {}) {

		this.name = name;

		this.blocksMovement = blocksMovement;

		this.glyph = new Glyph({
			character: character,
			foreground: foreground,
			background: background
		});

		this.map = map;

		this.actFunction = actFunction;
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

	act() {
		return this.actFunction();
	}
}
