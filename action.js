'use strict';

export class Action {

	entity;
	map;

	constructor(entity) {
		this.entity = entity;
		this.map = this.entity.map;
	}
	
	perform() {}
}

export class WaitAction extends Action {

	perform() {
		console.log("The " + this.entity.name + " waits.");
		return;
	}
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
			const attackDescription = this.entity.name + " attacks " + target.name;

			const damage = this.entity.power - target.defense;
			if (damage > 0) {
				console.log(attackDescription + " for " + damage + " hit points.");
				target.setHitPoints(target.hitPoints - damage);
			} else {
				console.log(attackDescription + " but does no damage.");
			}
		});
	}
}
