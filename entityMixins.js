'use strict';

import { MeleeAction, MoveAction, WaitAction } from "./action.js";

export const EntityMixins = {};

EntityMixins.PlayerActor = {
	name: "PlayerActor",
	act: function() {
		this.map.game.refresh();
		this.map.game.engine.lock();

		// This code is left here in case I need to refactor the player actor act function
		// const actPromise = new Promise(
		// 	(resolve, reject) => {
		// 		setTimeout(() => {
		// 			resolve('ok');
		// 		}, 2000);
		// 	}
		// );

		// return actPromise;
	}
};

EntityMixins.HostileEnemy = {
	name: "HostileEnemy",
	act: function() {
		const target = this.map.player;
		const dx = target.x - this.x;
		const dy = target.y - this.y;
		const distance = Math.max(Math.abs(dx), Math.abs(dy));

		if (this.map.isTileVisible(this.x, this.y)) {
			if (distance <= 1) {
				new MeleeAction(this, dx, dy).perform();
				return;
			} else {
				this.path = this.getPathTo(this, target);
			}
		}

		if (this.path && this.path.length > 0) {
			const [dest_x, dest_y] = this.path.shift();
			new MoveAction(this, dest_x - this.x, dest_y - this.y).perform();
			return;
		}

		new WaitAction(this).perform();
		return;
	},

	getPathTo: function(source, target) {
		const pathfinder = new ROT.Path.AStar(target.x, target.y, function(x, y) {
			const entity = source.map.getBlockingEntity(x, y);
			if (entity && entity !== source && entity !== target) {
				return false;
			}
			return source.map.isTileInBounds(x, y) && source.map.isTileWalkable(x, y);
		}, {topology: 8});

		const path = [];
		pathfinder.compute(source.x, source.y, function(x, y) {
			path.push([x, y]);
		});
		path.shift(); // The first element in the path array is the source position. Discard it.
		return path;
	}
};

EntityMixins.Destructible = {
	name: "Destructible",
	init: function({
		maxHitPoints = 10,
		hitPoints,
		defense
	} = {}) {
		this.maxHitPoints = maxHitPoints;
		this.hitPoints = hitPoints || maxHitPoints;
		this.defense = defense;
	}
}

EntityMixins.Attacker = {
	name: "Attacker",
	init: function({
		power
	} = {}) {
		this.power = power;
	}
}
