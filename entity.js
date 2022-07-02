'use strict';

import { Glyph } from "./glyph.js";

export class Entity {

	name;

	x;
	y;

	blocksMovement;
	
	glyph;

	renderOrder;

	map;

	mixins;

	constructor({
		name = "<Unnamed>",
		character = "?",
		foreground,
		background,
		renderOrder,
		blocksMovement = false,
		mixins = {}
	} = {}) {

		this.name = name;

		this.glyph = new Glyph({
			character: character,
			foreground: foreground,
			background: background
		});

		this.renderOrder = renderOrder;

		this.blocksMovement = blocksMovement;

		this.mixins = {};

		mixins.forEach(mixinDeclaration => {
			const [mixin, parameters] = mixinDeclaration;
			this.mixins[mixin.name] = true;
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

	setMap(map) {
		this.map = map;
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

	hasMixin(name) {
		return this.mixins[name];
	}
}

// TODO:
// Actors, items, other stuff is all an Entity
	// An entity is an actor or item etc for the purpose of driving game behavior
		// if it has an Actor, Item, etc mixin
		// All behavior is defined as some kind of mixin
		// Blocks movement? mixin
		// etc
