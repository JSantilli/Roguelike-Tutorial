'use strict';

import { Entity } from "./entity.js";

export class Player extends Entity {

	constructor(x, y, character, color, game) {
		super(x, y, character, color, game);
	}

	act() {
		super.act();

		this.game.refresh();

		this.game.engine.lock();
	}
}
