'use strict';

import { Colors } from "./colors.js";
import { ImpossibleError } from "./exceptions.js";

export class Action {

	entity;
	map;

	constructor(entity) {
		this.entity = entity;
		this.map = this.entity.map;
	}
	
	perform() {}
}

export class ChangeViewAction extends Action {

	newView;

	constructor(entity, newView) {
		super(entity);

		this.newView = newView;
	}

	perform() {

		this.map.game.switchScreen(this.newView);
	}
}

export class ScrollAction extends Action {

	cursorAdjust;

	constructor(entity, cursorAdjust) {
		super(entity);

		this.cursorAdjust = cursorAdjust;
	}
	
	perform () {

		this.map.game.screen.scrollList(this.cursorAdjust);
	}
}

export class AdjustCursorAction extends Action {

	dx;
	dy;

	constructor(entity, dx, dy) {
		super(entity);

		this.dx = dx;
		this.dy = dy;
	}
	
	perform () {

		this.map.game.screen.changeCursor(this.dx, this.dy);
	}
}

export class SetCursorAction extends Action {

	x;
	y;

	constructor(entity, x, y) {
		super(entity);

		this.x = x;
		this.y = y;
	}
	
	perform () {

		this.map.game.screen.setCursor(this.x, this.y);
	}
}

export class WaitAction extends Action {

	perform() {}
}

export class ActionWithDirection extends Action {
	
	dx;
	dy;
	destinationX;
	destinationY;
	
	constructor(entity, dx, dy) {
		super(entity);
		
		this.dx = dx;
		this.dy = dy;

		this.destinationX = this.entity.x + this.dx;
		this.destinationY = this.entity.y + this.dy;
	}

	perform() {}
}

export class BumpAction extends ActionWithDirection {

	perform() {

		if (this.map.getBlockingEntities(this.destinationX, this.destinationY)) {
			return new MeleeAction(this.entity, this.dx, this.dy).perform();
		} else {
			return new MoveAction(this.entity, this.dx, this.dy).perform();
		}
	}
}

export class MoveAction extends ActionWithDirection {

	perform() {

		if (!this.map.isTileInBounds(this.destinationX, this.destinationY)) {
			// Destination out of bounds
			throw new ImpossibleError("The way is blocked.");
		}

		if (!this.map.isTileWalkable(this.destinationX, this.destinationY)) {
			// Destination is not walkble
			throw new ImpossibleError("The way is blocked.");
		}

		if (this.map.getBlockingEntities(this.destinationX, this.destinationY)) {
			// Destination contains an entity that blocks movement
			throw new ImpossibleError("The way is blocked.");
		}

		this.entity.setPosition(this.destinationX, this.destinationY);
	}
}

export class MeleeAction extends ActionWithDirection {

	perform() {

		const targets = this.map.getBlockingEntities(this.destinationX, this.destinationY);

		if (!targets) {
			throw new ImpossibleError("Nothing to attack.");
		}

		targets.forEach(target => {

			let attackColor = Colors.EnemyAttack;
			if (this.entity === this.map.player) {
				attackColor = Colors.PlayerAttack;
			}

			const attackDescription = ROT.Util.capitalize(this.entity.name) + " attacks " + target.name;
			let attackMessage;

			const damage = this.entity.power - target.defense;
			if (damage > 0) {
				attackMessage = attackDescription + " for " + damage + " hit points.";
			} else {
				attackMessage = attackDescription + " but does no damage.";
			}

			this.map.game.messageLog.addMessage(attackMessage, attackColor);

			if (damage > 0) {
				// TODO: Eventually I should be calling into the target 'takeDamage' function
				// That function can instead do the work of mitigating damage with defense?
				target.setHitPoints(target.hitPoints - damage);
			}

		});
	}
}

export class ItemAction extends Action {

	item;

	target;

	constructor(entity, item, target) {
		super(entity);

		this.item = item;

		if (target) {
			this.target = target;
		} else {
			this.target = this.entity;
		}
	}

	perform() {

		// TODO: Currently each item can only have one mixin 'activateItem' function that fires on use
		// It would be cool if the activateItem functions could be stored in an array or something
		// and then iterated over here so it would trigger all effects.
		this.item.activateItem(this.target);
	}
}

export class PickupAction extends Action {

	// TODO: move the meat of this function to the InventoryHolder mixin

	perform() {

		const inventory = this.entity.inventory;

		const items = this.map.getItemsAt(this.entity.x, this.entity.y);
		if (items) {
			for (const item of items) {
				if (inventory.length >= this.entity.inventoryCapacity) {
					throw new ImpossibleError("Your inventory is full.");
				}

				this.map.removeEntity(item);
				// TODO: item still has a reference to map and an x + y. These should be removed.
				inventory.push(item);

				const pickupMessage = "You picked up the " + item.name + "!";
				this.map.game.messageLog.addMessage(pickupMessage);
			}
		} else {
			throw new ImpossibleError("There is nothing here to pick up.");
		}
	}
}

export class DropAction extends ItemAction {

	perform() {
		
		this.entity.dropItem(this.item);
	}
}
