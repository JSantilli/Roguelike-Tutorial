'use strict';

import { BumpAction, ScrollAction, ChangeViewAction, WaitAction, PickupAction, DropAction, ItemAction } from "./action.js";
import { Colors } from "./colors.js";
import { ImpossibleError } from "./exceptions.js";
import { clearLine } from "./renderFunctions.js";
import { ScreenDefinitions } from "./screens.js";

class EventHandler {

	game;

	constructor(game) {
		this.game = game;
	}

	handleKeydown(keyCode) {};

	handleMousemove() {};

	handleClick() {};
}

export class MainGameEventHandler extends EventHandler {

	directionKeys;
	waitKeys;
	viewKeys;

	constructor(game) {
		super(game);

		// TODO: it might be cool to abstract the keybind definitions away from the specific event handler.
		this.directionKeys = {};
		this.directionKeys[ROT.KEYS.VK_UP] = 0;
		this.directionKeys[ROT.KEYS.VK_RIGHT] = 2;
		this.directionKeys[ROT.KEYS.VK_DOWN] = 4;
		this.directionKeys[ROT.KEYS.VK_LEFT] = 6;

		// this.directionKeys[ROT.KEYS.VK_I] = 0;
		this.directionKeys[ROT.KEYS.VK_O] = 1;
		this.directionKeys[ROT.KEYS.VK_L] = 2;
		this.directionKeys[ROT.KEYS.VK_PERIOD] = 3;
		this.directionKeys[ROT.KEYS.VK_COMMA] = 4;
		this.directionKeys[ROT.KEYS.VK_M] = 5;
		this.directionKeys[ROT.KEYS.VK_J] = 6;
		this.directionKeys[ROT.KEYS.VK_U] = 7;

		this.waitKey = ROT.KEYS.VK_K;

		this.viewKey = ROT.KEYS.VK_V;

		this.pickupKey = ROT.KEYS.VK_G;

		this.inventoryKey = ROT.KEYS.VK_I;

		this.dropKey = ROT.KEYS.VK_D;
	}

	handleKeydown(keyCode) {

		let shouldUnlock = false;
		
		try {

			if (keyCode in this.directionKeys) {
				const [dx, dy] = ROT.DIRS[8][this.directionKeys[keyCode]];
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

	handleMousemove(event) {
		
		const [x, y] = this.game.display.eventToPosition(event);

		clearLine(this.game.display, 21, 44);

		if (this.game.map.isTileVisible(x, y)) {
			const entities = this.game.map.getEntitiesAt(x, y);
			if (entities) {
				const entityArray = Array.from(entities);
				const entityString = ROT.Util.capitalize(entityArray.map(entity => entity.name).join(", "));
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

	handleKeydown(keyCode) {

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
			ROT.KEYS.VK_SHIFT
		];
	}

	handleKeydown(keyCode) {

		if (this.ignoredKeys.includes(keyCode)) {
			return;
		} else {
			new ChangeViewAction(this.game.map.player, ScreenDefinitions.MainGame).perform();
		}
	}

	handleClick(event) {
		
		new ChangeViewAction(this.game.map.player, ScreenDefinitions.MainGame).perform();
	}
}

export class InventoryEventHandler extends AskUserEventHandler {

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

	handleKeydown(keyCode) {

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

		super.handleKeydown(keyCode);
	}

	onItemSelected(item) {}
}

export class InventoryActivateEventHandler extends InventoryEventHandler {

	onItemSelected(item) {

		try {
			new ItemAction(this.game.map.player, item).perform();
			new ChangeViewAction(this.game.map.player, ScreenDefinitions.MainGame).perform();
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

/* 

class InventoryActivateHandler(InventoryEventHandler):
    """Handle using an inventory item."""

    TITLE = "Select an item to use"

    def on_item_selected(self, item: Item) -> Optional[Action]:
        """Return the action for the selected item."""
        return item.consumable.get_action(self.engine.player)


class InventoryDropHandler(InventoryEventHandler):
    """Handle dropping an inventory item."""

    TITLE = "Select an item to drop"

    def on_item_selected(self, item: Item) -> Optional[Action]:
        """Drop this item."""
        return actions.DropItem(self.engine.player, item)

 */
