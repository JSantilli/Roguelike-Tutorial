'use strict';

export class InputHandler {

	game;
	currentEventHandler;

	constructor(game) {

		this.game = game;

		window.addEventListener("keydown", this);
		window.addEventListener("mousemove", this);
	}

	handleEvent(e) {

		switch (e.type) {
			case "keydown":
				this.eventKeydown(e);
				break;

			case "mousemove":
				this.eventMousemove(e);
				break;

			default:
				break;
		}
	}

	eventKeydown(e) {
		const keyCode = e.keyCode;
		this.game.screen.eventHandler.handleKeydown(keyCode);
	}

	eventMousemove(e) {
		this.game.screen.eventHandler.handleMousemove(e);
	}
}
