'use strict';

export class InputHandler {

	game;
	currentEventHandler;

	constructor(game) {

		this.game = game;

		window.addEventListener("keydown", this);
	}

	handleEvent(e) {
		if (e.type == "keydown") {
			this.eventKeydown(e);
		}
	}

	eventKeydown(e) {
		const keyCode = e.keyCode;
		this.game.screen.eventHandler.handleKeydown(keyCode);
	}
}
