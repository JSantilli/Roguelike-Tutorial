'use strict';

import { Glyph } from "./glyph.js";

export class Entity {

	name;

	x;
	y;

	// blocksMovement should eventually become a mixin
	blocksMovement;

	glyph;

	renderOrder;

	map;

	mixins;
	mixinGroups;

	constructor({
		name = "<Unnamed>",
		character = "?",
		foreground,
		background,
		renderOrder,
		blocksMovement = false,
		mixins = []
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
		this.mixinGroups = {};

		mixins.forEach(mixinDeclaration => {
			const [mixin, parameters] = mixinDeclaration;
			this.mixins[mixin.name] = true;
			if (mixin.group) {
				this.mixinGroups[mixin.group] = true;
			}
			for (const key in mixin) {
				if (key !== "name" && key !== "group" && key !== "init") {
					this[key] = mixin[key];
				}
			}
			if (mixin.init) {
				mixin.init.call(this, parameters);
			}
		});
	}

	setPosition(x, y, map) {

		if (map) {
			this.map = map;
		}

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

	hasGroup(name) {

		return this.mixinGroups[name];
	}

	getDistanceFrom(x, y) {

		// Below calculates the actual distance assuming diagonals take √2 movement vs 1
		// 	but since diagonals cost no extra movement, we want to calculate distance as though diagonals are length 1
		// return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
		
		return Math.max(Math.abs(x - this.x), Math.abs(y - this.y));
	}
}
