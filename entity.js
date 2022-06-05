'use strict';

export class Entity {

	x;
	y;
	character;
	color;
	
	game;

	constructor(x, y, character, color, game) {
		this.x = x;
		this.y = y;
		this.character = character;
		this.color = color;

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
		this.game.display.draw(this.x, this.y, this.character, this.color.colorStr);
	}
}
