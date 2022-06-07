'use strict';

import { Glyph } from "./glyph.js";

export class Entity {

	x;
	y;
	
	glyph;
	
	game;

	constructor(x, y, character, foreground, background, game) {
		this.x = x;
		this.y = y;
		
		this.glyph = new Glyph({
			character: character,
			foreground: foreground,
			background: background
		});

		this.game = game;
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}

	tryMove(direction) {
		const [dx, dy] = direction;
		const new_x = this.x + dx;
		const new_y = this.y + dy;

		if (!this.game.map.isInBounds(new_x, new_y)) {
			return;
		} else if (!this.game.map.getTile(new_x, new_y).walkable) {
			return;
		}

		this.setPosition(new_x, new_y);
	}

	act() {
		//
	}

	draw() {
		this.game.display.draw(this.x, this.y, this.glyph.character, this.glyph.foreground.colorStr, this.glyph.background.colorStr);
	}
}
