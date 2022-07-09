// TODO: I kind of like this pattern for Screens

import { GameOverEventHandler, MainGameEventHandler, ScrollingViewEventHandler } from "./eventHandlers.js";
import { drawCenteredText, drawFrame } from "./renderFunctions.js";

// Maybe I should migrate Tile and Color to a similar pattern
export const ScreenDefinitions = {};

ScreenDefinitions.MainGame = {
	eventHandlerClass: MainGameEventHandler,
	init: function () { },
	render: function () { },
	exit: function () { }
};

ScreenDefinitions.GameOver = {
	eventHandlerClass: GameOverEventHandler,
	init: function () { },
	render: function () { },
	exit: function () { }
};

ScreenDefinitions.ViewMessages = {
	eventHandlerClass: ScrollingViewEventHandler,
	init: function () {

		this.displayWidth = this.game.screenWidth - 6;
		this.displayHeight = this.game.screenHeight - 6;

		const displayOptions = {
			width: this.displayWidth,
			height: this.displayHeight,
			forceSquareRatio: true,
			bg: "#111"
		}

		this.display = new ROT.Display(displayOptions);
		this.displayElement = document.body.appendChild(this.display.getContainer());
		this.displayElement.style = "position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; margin:auto;";

		this.cursorPosition = 0;

		// TODO: do screens end up having mixins too?

		this.scrollList = function (cursorAdjust) {

			const newCursorPosition = ROT.Util.clamp(this.cursorPosition + cursorAdjust, 0, this.game.messageLog.getLength() - 1);

			if (newCursorPosition !== this.cursorPosition) {
				this.cursorPosition = newCursorPosition;
				this.render();
			}
		}

	},
	render: function () {

		this.display.clear();

		drawFrame(this.display, 0, 0, this.displayWidth, this.displayHeight);

		drawCenteredText(this.display, 0, 0, this.displayWidth, "┤Message History├");

		this.game.messageLog.render(this.display, 1, 1, this.displayWidth - 2, this.displayHeight - 2, this.cursorPosition);
	},
	exit: function () {
		this.displayElement.remove();
	}
};
