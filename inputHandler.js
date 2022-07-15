'use strict';

export class InputHandler {

	game;
	currentEventHandler;

	constructor(game) {

		this.game = game;

		window.addEventListener("keydown", this);
		window.addEventListener("mousemove", this);
		window.addEventListener("click", this);
	}

	handleEvent(e) {

		switch (e.type) {
			case "keydown":
				this.game.screen.eventHandler.handleKeydown(e);
				break;

			case "mousemove":
				this.game.screen.eventHandler.handleMousemove(e);
				break;

			case "click":
				this.game.screen.eventHandler.handleClick(e);
				break;

			default:
				break;
		}
	}
}
