'use strict';

export class InputHandler {

	currentEventHandler;

	constructor() {
		window.addEventListener("keydown", this);
	}

	setCurrentEventHandler(eventHandler) {
		this.currentEventHandler = eventHandler;
	}

	handleEvent(e) {
		if (e.type == "keydown") {
			this.eventKeydown(e);
		}
	}

	eventKeydown(e) {
		const keyCode = e.keyCode;
		this.currentEventHandler.handleKeydown(keyCode);
	}
}
