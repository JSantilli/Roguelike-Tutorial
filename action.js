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
	dest_x;
	dest_y;
	
	constructor(entity, dx, dy) {
		super(entity);
		
		this.dx = dx;
		this.dy = dy;

		this.dest_x = this.entity.x + this.dx;
		this.dest_y = this.entity.y + this.dy;
	}

	perform() {}
}

export class BumpAction extends ActionWithDirection {

	perform() {
		if (this.map.getBlockingEntity(this.dest_x, this.dest_y)) {
			// Melee attack against target
			return new MeleeAction(this.entity, this.dx, this.dy).perform();
		} else {
			return new MoveAction(this.entity, this.dx, this.dy).perform();
		}
	}
}

export class MoveAction extends ActionWithDirection {

	perform() {
		if (!this.map.isTileInBounds(this.dest_x, this.dest_y)) {
			// Destination out of bounds
			return;
		}

		if (!this.map.isTileWalkable(this.dest_x, this.dest_y)) {
			// Destination is not walkble
			return;
		}

		if (this.map.getBlockingEntity(this.dest_x, this.dest_y)) {
			// Destination contains an entity that blocks movement
			return;
		}

		this.entity.setPosition(this.dest_x, this.dest_y);
	}
}

export class MeleeAction extends ActionWithDirection {

	perform() {
		const target = this.map.getEntityAt(this.dest_x, this.dest_y);

		if (!target) {
			return;
		}

		console.log("You kick the " + target.name + ", much to its annoyance!");
	}
}
