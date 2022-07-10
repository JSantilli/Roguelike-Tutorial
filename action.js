'use strict';

import { Colors } from "./colors.js";

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

		if (this.map.getBlockingEntities(this.destinationX, this.destinationY).length !== 0) {
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
			return;
		}

		if (!this.map.isTileWalkable(this.destinationX, this.destinationY)) {
			// Destination is not walkble
			return;
		}

		if (this.map.getBlockingEntities(this.destinationX, this.destinationY).length !== 0) {
			// Destination contains an entity that blocks movement
			return;
		}

		this.entity.setPosition(this.destinationX, this.destinationY);
	}
}

export class MeleeAction extends ActionWithDirection {

	perform() {

		const targets = this.map.getBlockingEntities(this.destinationX, this.destinationY);

		if (targets.length === 0) {
			return;
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
