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
				this.eventKeydown(e);
				break;

			case "mousemove":
				this.eventMousemove(e);
				break;

			case "click":
				this.eventClick(e);
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

	eventClick(e) {

		this.game.screen.eventHandler.handleClick(e);
	}
}
