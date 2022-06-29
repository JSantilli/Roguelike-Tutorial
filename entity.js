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

		this.mixins = [];

		mixins.forEach(mixinDeclaration => {
			const [mixin, parameters] = mixinDeclaration;
			this.mixins.push(mixin.name);
			for (const key in mixin) {
				if (key !== 'name' && key !== 'init') {
					this[key] = mixin[key];
				}
			}
			if (mixin.init) {
				mixin.init.call(this, parameters);
			}
		});
	}

	setPosition(x, y) {
		const oldX = this.x;
		const oldY = this.y;

		this.x = x;
		this.y = y;

		if (this.map) {
			this.map.updateEntityPosition(this, oldX, oldY);
		}
	}
}
