'use strict';

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

EntityMixins.MonsterActor = {
	name: "MonsterActor",
	act: function() {
		console.log("MIXIN: The " + this.name + " wonders when it will get to take a real turn.");
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
