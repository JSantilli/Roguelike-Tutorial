

'use strict';

import { BumpAction } from "./action.js";

export class EventHandler {

	game;
	keyMap;
	
	constructor(game) {

		this.game = game;

		this.keyMap = {};
		this.keyMap[ROT.KEYS.VK_UP] = 0;
		this.keyMap[ROT.KEYS.VK_RIGHT] = 1;
		this.keyMap[ROT.KEYS.VK_DOWN] = 2;
		this.keyMap[ROT.KEYS.VK_LEFT] = 3;

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

		const [dx, dy] = ROT.DIRS[4][this.keyMap[keyCode]];

		let action = new BumpAction(this.game.map.player, dx, dy);
		action.perform();
		
		this.game.engine.unlock();
	}
}
