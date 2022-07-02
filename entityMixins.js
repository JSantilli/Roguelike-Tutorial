'use strict';

import { MeleeAction, MoveAction, WaitAction } from "./action.js";
import { GameOverEventHandler } from "./eventHandlers.js";
import { Glyph } from "./glyph.js";
import { RenderOrder } from "./renderOrder.js";

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
		if (!this.hasMixin("Destructible") || this.isAlive) {
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
				const [destinationX, destinationY] = this.path.shift();
				new MoveAction(this, destinationX - this.x, destinationY - this.y).perform();
				return;
			}

			new WaitAction(this).perform();
			return;
		}
	},

	getPathTo: function(source, target) {
		const pathfinder = new ROT.Path.AStar(target.x, target.y, function(x, y) {
			const blockingEntities = source.map.getBlockingEntities(x, y);
			if (blockingEntities.length !== 0) {
				blockingEntities.forEach(entity => {
					if (entity !== source && entity !== target) {
						return false;
					}
				});
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
		defense,
		isAlive = true
	} = {}) {
		this.maxHitPoints = maxHitPoints;
		this.hitPoints = Math.min(hitPoints || maxHitPoints, maxHitPoints);
		this.defense = defense;
		this.isAlive = isAlive
	},

	setHitPoints(value) {
		this.hitPoints = Math.max(0, Math.min(value, this.maxHitPoints));
		if (this.hitPoints === 0) {
			this.die();
		}
	},

	die() {

		// TODO: I should probably remove the entity from the scheduler when they die.

		let deathMessage = "";

		if (this === this.map.player) {
			deathMessage = "You died!";
			this.map.game.setCurrentEventHandler(GameOverEventHandler);
		} else {
			deathMessage = this.name + " is dead!";
		}
		
		console.log(deathMessage);

		this.isAlive = false;
		this.blocksMovement = false;
		this.name = "remains of " + this.name;
		this.glyph = Glyph.corpseGlyph;
		this.renderOrder = RenderOrder.Corpse;
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
