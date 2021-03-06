'use strict';

import { Colors } from "./colors.js";
import { GameOverEventHandler, InventoryActivateEventHandler, InventoryDropEventHandler, LookEventHandler, MainGameEventHandler, ScrollingViewEventHandler, SingleRangedAttackHandler } from "./eventHandlers.js";
import { clearLine, drawCenteredText, drawFrame } from "./renderFunctions.js";

// Maybe I should migrate Tile and Color to a similar pattern
export const ScreenDefinitions = {};

ScreenDefinitions.MainGame = {
	eventHandlerClass: MainGameEventHandler,

	init: function () { },
	
	render: function () {

		this.game.refresh();
	},
	
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
			bg: Colors.SubMenu
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

ScreenDefinitions.InventoryActivate = {
	eventHandlerClass: InventoryActivateEventHandler,

	init: function () {

		this.title = "Select an item to use";

		this.inventory = this.game.map.player.inventory;

		this.displayWidth = this.title.length + 4;
		this.displayHeight = this.inventory.length + 2;
		if (this.displayHeight < 3) {
			this.displayHeight = 3;
		}

		const displayOptions = {
			width: this.displayWidth,
			height: this.displayHeight,
			forceSquareRatio: true,
			bg: Colors.SubMenu
		}

		this.display = new ROT.Display(displayOptions);
		this.displayElement = document.body.appendChild(this.display.getContainer());
		this.displayElement.style = "position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; margin:auto;";
	},

	render: function () {

		this.display.clear();

		drawFrame(this.display, 0, 0, this.displayWidth, this.displayHeight);

		drawCenteredText(this.display, 0, 0, this.displayWidth, this.title);

		if (this.inventory.length > 0) {
			for (let i = 0; i < this.inventory.length; i++) {
				const itemKey = String.fromCharCode("a".charCodeAt() + i);
				const item = this.inventory[i];
				const itemString = "(" + itemKey + ") " + item.name;
				this.display.drawText(1, i + 1, itemString);
			}
		} else {
			this.display.drawText(1, 1, "(Empty)");
		}
	},
	exit: function () {

		this.displayElement.remove();
	}
};

// TODO: this is nearly identical to InventoryActivate

// TODO: some of the new display logic is very similar between these and ViewMessages

ScreenDefinitions.InventoryDrop = {
	eventHandlerClass: InventoryDropEventHandler,

	init: function () {

		this.title = "Select an item to drop";

		this.inventory = this.game.map.player.inventory;

		this.displayWidth = this.title.length + 4;
		this.displayHeight = this.inventory.length + 2;
		if (this.displayHeight < 3) {
			this.displayHeight = 3;
		}

		const displayOptions = {
			width: this.displayWidth,
			height: this.displayHeight,
			forceSquareRatio: true,
			bg: Colors.SubMenu
		}

		this.display = new ROT.Display(displayOptions);
		this.displayElement = document.body.appendChild(this.display.getContainer());
		this.displayElement.style = "position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; margin:auto;";
	},

	render: function () {

		this.display.clear();

		drawFrame(this.display, 0, 0, this.displayWidth, this.displayHeight);

		drawCenteredText(this.display, 0, 0, this.displayWidth, this.title);

		if (this.inventory.length > 0) {
			for (let i = 0; i < this.inventory.length; i++) {
				const itemKey = String.fromCharCode("a".charCodeAt() + i);
				const item = this.inventory[i];
				const itemString = "(" + itemKey + ") " + item.name;
				this.display.drawText(1, i + 1, itemString);
			}
		} else {
			this.display.drawText(1, 1, "(Empty)");
		}
	},

	exit: function () {

		this.displayElement.remove();
	}
};

ScreenDefinitions.Look = {
	eventHandlerClass: LookEventHandler,

	init: function () {

		this.cursorX = this.game.map.player.x;
		this.cursorY = this.game.map.player.y;

		this.setCursor = function (x, y) {

			const newCursorX = ROT.Util.clamp(x, 0, this.game.map.width - 1);
			const newCursorY = ROT.Util.clamp(y, 0, this.game.map.height - 1);

			if (newCursorX !== this.cursorX || newCursorY !== this.cursorY) {
				this.cursorX = newCursorX;
				this.cursorY = newCursorY;
				this.render();
			}
		}

		this.changeCursor = function (dx, dy) {

			this.setCursor(this.cursorX + dx, this.cursorY + dy);
		}
	},

	render: function () {

		this.game.refresh();

		// There isn't a great way in ROT.js to draw a cursor over an existing tile, so this just covers the glyph
		// Maybe there's a good way to make a glyph flash between the entities on it's tile? (and this cursor)
		this.game.display.drawOver(this.cursorX, this.cursorY, "X", Colors.White);

		clearLine(this.game.display, 21, 44);

		if (this.game.map.isTileVisible(this.cursorX, this.cursorY)) {
			const entities = this.game.map.getEntitiesAt(this.cursorX, this.cursorY);
			if (entities) {
				const entityString = ROT.Util.capitalize(entities.map(entity => entity.name).join(", "));
				this.game.display.drawText(21, 44, entityString);
			}
		}
	},

	exit: function () { }
};

// TODO: screens need to have some kind of inheritance behavior.
// This is basically identical to the Look Screen
ScreenDefinitions.SingleRangedAttack = {
	eventHandlerClass: SingleRangedAttackHandler,

	init: function () {

		this.cursorX = this.game.map.player.x;
		this.cursorY = this.game.map.player.y;

		this.callback = null;

		this.setCursor = function (x, y) {

			const newCursorX = ROT.Util.clamp(x, 0, this.game.map.width - 1);
			const newCursorY = ROT.Util.clamp(y, 0, this.game.map.height - 1);

			if (newCursorX !== this.cursorX || newCursorY !== this.cursorY) {
				this.cursorX = newCursorX;
				this.cursorY = newCursorY;
				this.render();
			}
		}

		this.changeCursor = function (dx, dy) {

			this.setCursor(this.cursorX + dx, this.cursorY + dy);
		}

		this.setItemAndUser = function (item, user) {

			this.item = item;
			this.user = user;
		}

		this.setCallback = function (action) {

			this.callback = action;
		}
	},

	render: function () {

		this.game.refresh();

		// There isn't a great way in ROT.js to draw a cursor over an existing tile, so this just covers the glyph
		// Maybe there's a good way to make a glyph flash between the entities on it's tile? (and this cursor)
		this.game.display.drawOver(this.cursorX, this.cursorY, "X", Colors.White);

		clearLine(this.game.display, 21, 44);

		if (this.game.map.isTileVisible(this.cursorX, this.cursorY)) {
			const entities = this.game.map.getEntitiesAt(this.cursorX, this.cursorY);
			if (entities) {
				const entityString = ROT.Util.capitalize(entities.map(entity => entity.name).join(", "));
				this.game.display.drawText(21, 44, entityString);
			}
		}
	},

	exit: function () { }
};

ScreenDefinitions.AreaRangedAttack = {
	eventHandlerClass: SingleRangedAttackHandler,

	init: function () {

		this.cursorX = this.game.map.player.x;
		this.cursorY = this.game.map.player.y;

		this.callback = null;

		this.setCursor = function (x, y) {

			const newCursorX = ROT.Util.clamp(x, 0, this.game.map.width - 1);
			const newCursorY = ROT.Util.clamp(y, 0, this.game.map.height - 1);

			if (newCursorX !== this.cursorX || newCursorY !== this.cursorY) {
				this.cursorX = newCursorX;
				this.cursorY = newCursorY;
				this.render();
			}
		}

		this.changeCursor = function (dx, dy) {

			this.setCursor(this.cursorX + dx, this.cursorY + dy);
		}

		this.setItemAndUser = function (item, user) {

			this.item = item;
			this.user = user;
		}

		this.setCallback = function (action) {

			this.callback = action;
		}
	},

	render: function () {

		this.game.refresh();

		// There isn't a great way in ROT.js to draw a cursor over an existing tile, so this just covers the glyph
		// Maybe there's a good way to make a glyph flash between the entities on it's tile? (and this cursor)
		this.game.display.drawOver(this.cursorX, this.cursorY, "X", Colors.White);

		clearLine(this.game.display, 21, 44);

		if (this.game.map.isTileVisible(this.cursorX, this.cursorY)) {
			const entities = this.game.map.getEntitiesAt(this.cursorX, this.cursorY);
			if (entities) {
				const entityString = ROT.Util.capitalize(entities.map(entity => entity.name).join(", "));
				this.game.display.drawText(21, 44, entityString);
			}
		}

		drawFrame(this.game.display, this.cursorX - this.item.radius - 1, this.cursorY - this.item.radius - 1, this.item.radius ** 2, this.item.radius ** 2, Colors.Red, true);
	},

	exit: function () { }
};
