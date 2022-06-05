'use strict';

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
		let keyCode = e.keyCode;

		if (!(keyCode in this.keyMap)) { return; } // invalid input

		let direction = ROT.DIRS[4][this.keyMap[keyCode]];
		this.game.player.tryMove(direction);
		
		this.game.engine.unlock();
	}
}
