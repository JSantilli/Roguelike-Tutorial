'use strict';

import { Entity } from "./entity.js";

export class Player extends Entity {

	constructor(x, y, character, foreground, background, game) {
		super(x, y, character, foreground, background, game);
	}

	act() {
		super.act();

		this.game.refresh();

		this.game.engine.lock();
	}
}
