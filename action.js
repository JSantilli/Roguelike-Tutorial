'use strict';

export class Action {
	
	perform() {}
}

export class ActionWithDirection extends Action {
	
	dx;
	dy;
	
	constructor(dx, dy) {
		super();
		
		this.dx = dx;
		this.dy = dy;
	}

	perform() {}
}

export class BumpAction extends ActionWithDirection {

	perform(map, entity) {
		const dest_x = entity.x + this.dx;
		const dest_y = entity.y + this.dy;

		if (map.getEntityAt(dest_x, dest_y) && map.getEntityAt(dest_x, dest_y).blocksMovement) {
			// Melee attack against target
			return new MeleeAction(this.dx, this.dy).perform(map, entity);
		} else {
			return new MoveAction(this.dx, this.dy).perform(map, entity);
		}
	}
}

export class MoveAction extends ActionWithDirection {

	perform(map, entity) {
		const dest_x = entity.x + this.dx;
		const dest_y = entity.y + this.dy;

		if (!map.isInBounds(dest_x, dest_y)) {
			// Destination out of bounds
			return;
		}

		if (!map.getTile(dest_x, dest_y).walkable) {
			// Destination is not walkble
			return;
		}

		if (map.getEntityAt(dest_x, dest_y) && map.getEntityAt(dest_x, dest_y).blocksMovement) {
			// Destination contains an entity that blocks movement
			return;
		}

		entity.setPosition(dest_x, dest_y);
	}
}

export class MeleeAction extends ActionWithDirection {

	perform(map, entity) {
		const dest_x = entity.x + this.dx;
		const dest_y = entity.y + this.dy;

		let target = map.getEntityAt(dest_x, dest_y);

		if (!target) {
			return;
		}

		console.log("You kick the " + target.name + ", much to its annoyance!");
	}
}
