

'use strict';

import { BumpAction, WaitAction } from "./action.js";

export class EventHandler {

	game;
	directionKeys;
	waitKeys;
	
	constructor(game) {

		this.game = game;

		this.directionKeys = {};
		this.directionKeys[ROT.KEYS.VK_UP] = 0;
		this.directionKeys[ROT.KEYS.VK_RIGHT] = 2;
		this.directionKeys[ROT.KEYS.VK_DOWN] = 4;
		this.directionKeys[ROT.KEYS.VK_LEFT] = 6;

		this.directionKeys[ROT.KEYS.VK_I] = 0;
		this.directionKeys[ROT.KEYS.VK_O] = 1;
		this.directionKeys[ROT.KEYS.VK_L] = 2;
		this.directionKeys[ROT.KEYS.VK_PERIOD] = 3;
		this.directionKeys[ROT.KEYS.VK_COMMA] = 4;
		this.directionKeys[ROT.KEYS.VK_M] = 5;
		this.directionKeys[ROT.KEYS.VK_J] = 6;
		this.directionKeys[ROT.KEYS.VK_U] = 7;

		this.waitKeys = {};
		this.waitKeys[ROT.KEYS.VK_K] = true;
		// TODO: This structure seems a little funky. This 'true' is totally unnecessary for the logic, but has to be here syntactically.

		window.addEventListener("keydown", this);
	}

	handleEvent(e) {
		if (e.type == "keydown") {
			this.event_keydown(e);
		}
	}

	event_keydown(e) {
		const keyCode = e.keyCode;

		if (keyCode in this.directionKeys) {
			const [dx, dy] = ROT.DIRS[8][this.directionKeys[keyCode]];
			new BumpAction(this.game.map.player, dx, dy).perform();
		} else if (keyCode in this.waitKeys) {
			new WaitAction(this.game.map.player).perform();
		}
		
		this.game.engine.unlock();
	}
}
