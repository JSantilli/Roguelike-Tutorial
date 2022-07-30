'use strict';

import { BumpAction, ScrollAction, ChangeViewAction, WaitAction, PickupAction, DropAction, ItemAction, AdjustCursorAction, SetCursorAction, TakeStairsAction } from "./action.js";
import { Colors } from "./colors.js";
import { ImpossibleError } from "./exceptions.js";
import { clearLine } from "./renderFunctions.js";
import { ScreenDefinitions } from "./screens.js";

class EventHandler {

	game;

	moveKeys;

	confirmKeys;

	constructor(game) {

		this.game = game;

		// TODO: it might be cool to abstract the keybind definitions away from the specific event handler.
		this.moveKeys = {};
		this.moveKeys[ROT.KEYS.VK_UP] = 0;
		this.moveKeys[ROT.KEYS.VK_RIGHT] = 2;
		this.moveKeys[ROT.KEYS.VK_DOWN] = 4;
		this.moveKeys[ROT.KEYS.VK_LEFT] = 6;

		// this.directionKeys[ROT.KEYS.VK_I] = 0;
		this.moveKeys[ROT.KEYS.VK_O] = 1;
		this.moveKeys[ROT.KEYS.VK_L] = 2;
		this.moveKeys[ROT.KEYS.VK_PERIOD] = 3;
		this.moveKeys[ROT.KEYS.VK_COMMA] = 4;
		this.moveKeys[ROT.KEYS.VK_M] = 5;
		this.moveKeys[ROT.KEYS.VK_J] = 6;
		this.moveKeys[ROT.KEYS.VK_U] = 7;

		this.confirmKeys = []
		this.confirmKeys.push(ROT.KEYS.VK_ENTER);
		this.confirmKeys.push(ROT.KEYS.VK_RETURN);
	}

	handleKeydown(e) { };

	handleMousemove(e) { };

	handleClick(e) { };
}

export class MainMenuEventHandler extends EventHandler {

	constructor(game) {
		super(game);

		this.newGameKey = ROT.KEYS.VK_N;
		this.continueGameKey = ROT.KEYS.VK_C;
	}

	handleKeydown(e) {

		const keyCode = e.keyCode;

		if (keyCode === this.newGameKey) {
			this.game.start();
		}

		else if (keyCode === this.continueGameKey) {
			this.game.loadGame();
		}
	}
}

export class MainGameEventHandler extends EventHandler {

	waitKey;
	viewKey;
	pickupKey;
	inventoryKey;
	dropKey;
	lookKey;
	saveKey;
	descendKey;
	characterInfoKey;

	constructor(game) {
		super(game);

		this.waitKey = ROT.KEYS.VK_K;

		this.viewKey = ROT.KEYS.VK_V;

		this.pickupKey = ROT.KEYS.VK_G;

		this.inventoryKey = ROT.KEYS.VK_I;

		this.dropKey = ROT.KEYS.VK_D;

		this.lookKey = ROT.KEYS.VK_SLASH;

		this.saveKey = ROT.KEYS.VK_S;

		this.descendKey = ROT.KEYS.VK_PERIOD;

		this.characterInfoKey = ROT.KEYS.VK_C;
	}

	handleKeydown(e) {

		// TODO: this removes the popup on any key press
		// This should be extended to also remove the popup on ANY eventhandler and for clicks as well
		// Eventually once all screens are rendered via the screen.render() (looking at you game!), just call screen.render on any input in the inputHandler.js
		this.game.refresh();

		const keyCode = e.keyCode;

		let shouldUnlock = false;

		try {

			if (keyCode === this.descendKey && e.shiftKey) {
				new TakeStairsAction(this.game.map.player).perform();
			}

			if (keyCode in this.moveKeys) {
				const [dx, dy] = ROT.DIRS[8][this.moveKeys[keyCode]];
				new BumpAction(this.game.map.player, dx, dy).perform();
				shouldUnlock = true;
			}

			else if (keyCode === this.waitKey) {
				new WaitAction(this.game.map.player).perform();
				shouldUnlock = true;
			}

			else if (keyCode === this.viewKey) {
				new ChangeViewAction(this.game.map.player, ScreenDefinitions.ViewMessages).perform();
			}

			else if (keyCode === this.pickupKey) {
				new PickupAction(this.game.map.player).perform();
				shouldUnlock = true;
			}

			else if (keyCode === this.inventoryKey) {
				new ChangeViewAction(this.game.map.player, ScreenDefinitions.InventoryActivate).perform();
			}

			else if (keyCode === this.dropKey) {
				new ChangeViewAction(this.game.map.player, ScreenDefinitions.InventoryDrop).perform();
			}

			else if (keyCode === this.lookKey) {
				new ChangeViewAction(this.game.map.player, ScreenDefinitions.Look).perform();
			}

			else if (keyCode === this.saveKey) {
				this.game.saveGame();
			}

			else if (keyCode === this.characterInfoKey) {
				new ChangeViewAction(this.game.map.player, ScreenDefinitions.CharacterInfo).perform();
			}

		} catch (e) {
			if (e instanceof ImpossibleError) {
				this.game.messageLog.addMessage(e.message, Colors.Impossible);
				this.game.refresh();
				return;
			} else {
				throw e;
			}
		}

		if (shouldUnlock) {
			this.game.engine.unlock();
		}
	}

	handleMousemove(e) {

		// TODO: the screen should just handle this rendering

		const [x, y] = this.game.display.eventToPosition(e);

		clearLine(this.game.display, 21, 44);

		if (this.game.map.isTileVisible(x, y)) {
			const entities = this.game.map.getEntitiesAt(x, y);
			if (entities) {
				const entityString = ROT.Util.capitalize(entities.map(entity => entity.name).join(", "));
				this.game.display.drawText(21, 44, entityString);
			}
		}
	}
}

export class GameOverEventHandler extends EventHandler {

	// TODO: Eventually there should be some refresh game action you can take
}

export class ScrollingViewEventHandler extends EventHandler {

	scrollKeys;

	constructor(game) {
		super(game);

		this.scrollKeys = {};
		this.scrollKeys[ROT.KEYS.VK_UP] = 1;
		this.scrollKeys[ROT.KEYS.VK_DOWN] = -1;
	}

	handleKeydown(e) {

		const keyCode = e.keyCode;

		if (keyCode in this.scrollKeys) {
			new ScrollAction(this.game.map.player, this.scrollKeys[keyCode]).perform();
		} else {
			new ChangeViewAction(this.game.map.player, ScreenDefinitions.MainGame).perform();
		}
	}
}

export class AskUserEventHandler extends EventHandler {

	ignoredKeys;

	constructor(game) {
		super(game);

		this.ignoredKeys = [
			ROT.KEYS.VK_ALT,
			ROT.KEYS.VK_CONTROL,
			ROT.KEYS.VK_META,
			ROT.KEYS.VK_SHIFT,
			ROT.KEYS.VK_WIN
		];
	}

	handleKeydown(e) {

		const keyCode = e.keyCode;

		if (this.ignoredKeys.includes(keyCode)) {
			return;
		} else {
			new ChangeViewAction(this.game.map.player, ScreenDefinitions.MainGame).perform();
		}
	}

	handleClick(e) {

		new ChangeViewAction(this.game.map.player, ScreenDefinitions.MainGame).perform();
	}
}

export class InventoryEventHandler extends AskUserEventHandler {

	handleKeydown(e) {

		const keyCode = e.keyCode;

		const index = keyCode - ROT.KEYS.VK_A;

		if (0 <= index && index <= 25) {
			const selectedItem = this.game.map.player.inventory[index];

			if (!selectedItem) {
				this.game.messageLog.addMessage("Invalid entry.", Colors.Invalid);
				this.game.refresh();
				return;
			}

			this.onItemSelected(selectedItem);
			return;
		}

		super.handleKeydown(e);
	}

	onItemSelected(item) { }
}

export class InventoryActivateEventHandler extends InventoryEventHandler {

	onItemSelected(item) {

		try {
			new ItemAction(this.game.map.player, item).perform();
		} catch (e) {
			if (e instanceof ImpossibleError) {
				this.game.messageLog.addMessage(e.message, Colors.Impossible);
				this.game.refresh();
				return;
			} else {
				throw e;
			}
		}
	}
}

export class InventoryDropEventHandler extends InventoryEventHandler {

	onItemSelected(item) {

		new DropAction(this.game.map.player, item).perform();
		new ChangeViewAction(this.game.map.player, ScreenDefinitions.MainGame).perform();
	}
}

export class SelectIndexEventHandler extends AskUserEventHandler {

	handleKeydown(e) {

		const keyCode = e.keyCode;

		if (keyCode in this.moveKeys) {
			let modifier = 1;
			if (e.shiftKey) {
				modifier *= 5;
			}
			if (e.ctrlKey) {
				modifier *= 10;
			}
			if (e.altKey) {
				modifier *= 20;
			}

			let [dx, dy] = ROT.DIRS[8][this.moveKeys[keyCode]];

			dx *= modifier;
			dy *= modifier;

			new AdjustCursorAction(this.game.map.player, dx, dy).perform();

			return;
		}

		else if (this.confirmKeys.includes(keyCode)) {
			try {
				return this.onIndexSelected();
			} catch (e) {
				if (e instanceof ImpossibleError) {
					this.game.messageLog.addMessage(e.message, Colors.Impossible);
					this.game.screen.render();
					return;
				}
			}
		}

		super.handleKeydown(e);
	}

	handleMousemove(e) {

		const [x, y] = this.game.display.eventToPosition(e);

		new SetCursorAction(this.game.map.player, x, y).perform();
	}

	handleClick(e) {

		const [x, y] = this.game.display.eventToPosition(e);

		new SetCursorAction(this.game.map.player, x, y).perform();

		try {
			return this.onIndexSelected();
		} catch (e) {
			if (e instanceof ImpossibleError) {
				this.game.messageLog.addMessage(e.message, Colors.Impossible);
				this.game.screen.render();
				return;
			}
		}
	}

	onIndexSelected() { }
}

export class LookEventHandler extends SelectIndexEventHandler {

	onIndexSelected() {

		new ChangeViewAction(this.game.map.player, ScreenDefinitions.MainGame).perform();
	}
}

export class SingleRangedAttackHandler extends SelectIndexEventHandler {

	onIndexSelected() {

		this.game.screen.callback(this.game.screen.item, this.game.screen.user, this.game.screen.cursorX, this.game.screen.cursorY);
	}
}

export class LevelUpEventHandler extends AskUserEventHandler {

	handleKeydown(e) {

		const keyCode = e.keyCode;

		const index = keyCode - ROT.KEYS.VK_A;

		if (0 <= index && index <= 2) {
			if (index === 0) {
				this.game.map.player.increaseMaxHp();
			} else if (index === 1) {
				this.game.map.player.increasePower();
			} else if (index === 2) {
				this.game.map.player.increaseDefense();
			} else {
				this.game.messageLog.addMessage("Invalid entry.", Colors.Invalid);
				return;
			}
			super.handleKeydown(e);
		}
	}

	handleClick(e) {

		return;
	}
}
