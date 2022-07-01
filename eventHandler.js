

'use strict';

import { BumpAction } from "./action.js";

export class EventHandler {

	game;
	keyMap;
	
	constructor(game) {

		this.game = game;

		this.keyMap = {};
		this.keyMap[ROT.KEYS.VK_UP] = 0;
		this.keyMap[ROT.KEYS.VK_RIGHT] = 2;
		this.keyMap[ROT.KEYS.VK_DOWN] = 4;
		this.keyMap[ROT.KEYS.VK_LEFT] = 6;

		this.keyMap[ROT.KEYS.VK_I] = 0;
		this.keyMap[ROT.KEYS.VK_O] = 1;
		this.keyMap[ROT.KEYS.VK_L] = 2;
		this.keyMap[ROT.KEYS.VK_PERIOD] = 3;
		this.keyMap[ROT.KEYS.VK_COMMA] = 4;
		this.keyMap[ROT.KEYS.VK_M] = 5;
		this.keyMap[ROT.KEYS.VK_J] = 6;
		this.keyMap[ROT.KEYS.VK_U] = 7;

		window.addEventListener("keydown", this);
	}

	handleEvent(e) {
		if (e.type == "keydown") {
			this.event_keydown(e);
		}
	}

	event_keydown(e) {
		const keyCode = e.keyCode;

		if (!(keyCode in this.keyMap)) { return; } // invalid input

		const [dx, dy] = ROT.DIRS[8][this.keyMap[keyCode]];

		new BumpAction(this.game.map.player, dx, dy).perform();
		
		this.game.engine.unlock();
	}
}
