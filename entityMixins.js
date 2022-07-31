'use strict';

import { ApplyStatusEffectAction, BumpAction, ChangeViewAction, MeleeAction, MoveAction, WaitAction } from "./action.js";
import { Colors } from "./colors.js";
import { EquipmentTypes } from "./equipmentTypes.js";
import { ImpossibleError } from "./exceptions.js";
import { Glyph } from "./glyph.js";
import { RenderOrder } from "./renderOrder.js";
import { ScreenDefinitions } from "./screens.js";

export const EntityMixins = {};

EntityMixins.PlayerActor = {
	name: "PlayerActor",
	group: "Actor",

	act() {

		this.map.game.refresh();
		this.map.game.engine.lock();

		if (this.requiresLevelUp()) {
			new ChangeViewAction(this.map.player, ScreenDefinitions.LevelUp).perform();
		}

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
	group: "Actor",

	statuses: null,

	init({
		statuses = {}
	} = {}) {

		this.statuses = statuses;
	},

	act() {

		// Entity should either not be destructible or it must be alive to act.
		if (!this.hasMixin("Destructible") || this.isAlive) {

			if ("confused" in this.statuses) {
				this.actConfused();
				return;
			}

			const target = this.map.player;
			const dx = target.x - this.x;
			const dy = target.y - this.y;
			const distance = Math.max(Math.abs(dx), Math.abs(dy));

			if (this.map.isTileVisible(this.x, this.y)) {
				if (distance <= 1) {
					if (this.hasMixin("Attacker")) {
						try {
							new MeleeAction(this, dx, dy).perform();
						} catch (e) {
							// AI errors get ignored for now.
							console.log(e);
						}
					}
					return;
				} else {
					this.path = this.getPathTo(this, target);
				}
			}

			if (this.path && this.path.length > 0) {
				const [destinationX, destinationY] = this.path.shift();
				try {
					new MoveAction(this, destinationX - this.x, destinationY - this.y).perform();
				} catch (e) {
					// AI errors get ignored for now.
					console.log(e);
				}
				return;
			}

			new WaitAction(this).perform();
		}
	},

	getPathTo(source, target) {

		const pathfinder = new ROT.Path.AStar(target.x, target.y, function (x, y) {
			const blockingEntities = source.map.getBlockingEntities(x, y);
			if (blockingEntities) {
				blockingEntities.forEach(entity => {
					if (entity !== source && entity !== target) {
						return false;
					}
				});
			}
			return source.map.isTileInBounds(x, y) && source.map.isTileWalkable(x, y);
		}, { topology: 8 });

		const path = [];
		pathfinder.compute(source.x, source.y, function (x, y) {
			path.push([x, y]);
		});
		path.shift(); // The first element in the path array is the source position. Discard it.
		return path;
	},

	actConfused() {

		if (this.statuses["confused"].turnsRemaining <= 0) {
			delete this.statuses["confused"];
			this.map.game.messageLog.addMessage("The " + this.name + " is no longer confused.");
		} else {
			const [dx, dy] = ROT.RNG.getItem([
				[-1, -1],
				[0, -1],
				[1, -1],
				[-1, 0],
				[1, 0],
				[-1, 1],
				[0, 1],
				[1, 1],
			]);

			try {
				new BumpAction(this, dx, dy).perform();
			} catch (e) {
				// AI errors get ignored for now.
				console.log(e);
			}

			this.statuses["confused"].turnsRemaining -= 1;
		}
	}
};

EntityMixins.ExperienceGainer = {
	name: "ExperienceGainer",

	init({
		currentLevel = 1,
		currentXp = 0,
		levelUpBase = 0,
		levelUpFactor = 150
	} = {}) {

		this.currentLevel = currentLevel;
		this.currentXp = currentXp;
		this.levelUpBase = levelUpBase;
		this.levelUpFactor = levelUpFactor;
	},

	getXpToNextLevel() {
		
		return this.levelUpBase + this.currentLevel * this.levelUpFactor;
	},

	requiresLevelUp() {

		return this.currentXp >= this.getXpToNextLevel();
	},

	addXp(xp) {

		if (xp === 0 || this.levelUpBase === 0) {
			return;
		}

		this.currentXp += xp;

		this.map.game.messageLog.addMessage("You gain " + xp + " experience points.");

		if (this.requiresLevelUp()) {
			this.map.game.messageLog.addMessage("You advance to level " + (this.currentLevel + 1) + "!");
		}
	},

	increaseLevel() {

		this.currentXp -= this.getXpToNextLevel();
		this.currentLevel += 1;
	},

	increaseMaxHp(amount = 20) {

		this.maxHitPoints += amount;
		this.hitPoints += amount;

		this.map.game.messageLog.addMessage("Your health improves!");

		this.increaseLevel();
	},

	increasePower(amount = 1) {

		this.basePower += amount;

		this.map.game.messageLog.addMessage("You feel stronger!");

		this.increaseLevel();
	},

	increaseDefense(amount = 1) {

		this.baseDefense += amount;

		this.map.game.messageLog.addMessage("Your movements are getting swifter!");

		this.increaseLevel();
	}
}

EntityMixins.ExperienceGiver = {
	name: "ExperienceGiver",

	init({
		xpGiven = 0
	} = {}) {

		this.xpGiven = xpGiven;
	}
}

EntityMixins.Destructible = {
	name: "Destructible",

	init({
		maxHitPoints = 10,
		hitPoints,
		baseDefense,
		isAlive = true
	} = {}) {

		this.maxHitPoints = maxHitPoints;
		this.hitPoints = Math.min(hitPoints || maxHitPoints, maxHitPoints);
		this.baseDefense = baseDefense;
		this.isAlive = isAlive
	},

	getDefense() {

		let defense = this.baseDefense;

		if (this.hasMixin("Equipper")) {
			defense += this.getDefenseBonus();
		}

		return defense;
	},

	setHitPoints(value) {

		this.hitPoints = ROT.Util.clamp(value, 0, this.maxHitPoints);
		if (this.hitPoints === 0) {
			this.die();
		}
	},

	heal(amount) {

		if (this.hitPoints === this.maxHitPoints) {
			return 0;
		}

		let newHitPointValue = this.hitPoints + amount;

		if (newHitPointValue > this.maxHitPoints) {
			newHitPointValue = this.maxHitPoints;
		}

		const amountRecovered = newHitPointValue - this.hitPoints;

		this.setHitPoints(newHitPointValue);

		return amountRecovered;
	},

	takeDamage(amount) {
		this.setHitPoints(this.hitPoints - amount);
	},

	die() {

		// TODO: I should probably remove the entity from the scheduler when they die.

		let deathMessage = "";
		let deathMessageColor;

		if (this === this.map.player) {
			deathMessage = "You died!";
			deathMessageColor = Colors.PlayerDie;
			this.map.game.switchScreen(ScreenDefinitions.GameOver);
		} else {
			deathMessage = this.name + " is dead!";
			deathMessageColor = Colors.EnemyDie;
		}

		this.map.game.messageLog.addMessage(deathMessage, deathMessageColor);

		if (this.map.player.hasMixin("ExperienceGainer") && this.hasMixin("ExperienceGiver")) {
			this.map.player.addXp(this.xpGiven);
		}

		this.isAlive = false;
		this.blocksMovement = false;
		this.name = "remains of " + this.name;
		this.glyph = Glyph.corpseGlyph;
		this.renderOrder = RenderOrder.Corpse;
	}
}

EntityMixins.Attacker = {
	name: "Attacker",

	init({
		basePower
	} = {}) {

		this.basePower = basePower;
	},

	getPower() {

		let power = this.basePower;

		if (this.hasMixin("Equipper")) {
			power += this.getPowerBonus();
		}

		return power;
	}
}

EntityMixins.InventoryHolder = {
	name: "InventoryHolder",

	init({
		inventoryCapacity = 0,
		inventory = []
	} = {}) {

		this.inventoryCapacity = inventoryCapacity;
		this.inventory = inventory;
	},

	removeItem(item) {

		const index = this.inventory.indexOf(item);
		if (index > -1) {
			this.inventory.splice(index, 1);
		}
	},

	dropItem(item) {

		this.removeItem(item);

		item.setPosition(this.x, this.y, this.map);

		const dropMessage = "You dropped the " + item.name + ".";
		this.map.game.messageLog.addMessage(dropMessage);
		this.map.game.refresh();
	}
}

EntityMixins.Consumable = {
	name: "Consumable",

	consume(consumer) {

		consumer.removeItem(this);
	}
}

EntityMixins.HealingItem = {
	name: "HealingItem",
	group: "Item",

	init({
		healingAmount
	} = {}) {

		this.healingAmount = healingAmount;
	},

	activateItem(user) {

		if (user.hasMixin("Destructible")) {
			const hitPointsRecovered = user.heal(this.healingAmount);

			if (hitPointsRecovered > 0) {
				const healingMessage = "You consume the " + this.name + ", and recover " + hitPointsRecovered + " HP!";
				this.map.game.messageLog.addMessage(healingMessage, Colors.HealthRecovered);
			} else {
				throw new ImpossibleError("Your health is already full.");
			}
		}

		if (this.hasMixin("Consumable") && user.hasMixin("InventoryHolder")) {
			this.consume(user);
		}

		this.map.game.switchScreen(ScreenDefinitions.MainGame);
		this.map.game.refresh();
	}
}

EntityMixins.LightningDamageItem = {
	name: "LightningDamageItem",
	group: "Item",

	init({
		damage,
		maximumRange
	} = {}) {

		this.damage = damage;
		this.maximumRange = maximumRange;
	},

	activateItem(user) {

		let target = null;
		let closestDistance = this.maximumRange + 1;

		const allMapEntities = user.map.getAllEntities();
		allMapEntities.forEach(entity => {
			if (entity !== user && user.map.isTileVisible(entity.x, entity.y)) {
				if (entity.hasGroup("Actor") && entity.hasMixin("Destructible")) {
					const distance = user.getDistanceFrom(entity.x, entity.y);

					if (distance < closestDistance) {
						target = entity;
						closestDistance = distance;
					}
				}
			}
		});

		if (target) {

			target.takeDamage(this.damage);

			const lightningMessage = "A lightning bolt strikes the " + target.name + " with a loud thunder, for " + this.damage + " damage!";
			this.map.game.messageLog.addMessage(lightningMessage, Colors.HealthRecovered);
		} else {
			throw new ImpossibleError("No enemy is close enough to strike.");
		}

		if (this.hasMixin("Consumable") && user.hasMixin("InventoryHolder")) {
			this.consume(user);
		}

		this.map.game.switchScreen(ScreenDefinitions.MainGame);
		this.map.game.refresh();
	}
}

EntityMixins.ConfusionItem = {
	name: "ConfusionItem",
	group: "Item",

	init({
		numberOfTurns
	} = {}) {

		this.numberOfTurns = numberOfTurns;
	},

	activateItem(user) {

		this.map.game.switchScreen(ScreenDefinitions.SingleRangedAttack, this, user);

		this.map.game.screen.setCallback(this.applyEffect);
	},

	applyEffect(item, user, x, y) {

		if (!user.map.isTileVisible(x, y)) {
			throw new ImpossibleError("You cannot target an area that you cannot see.");
		}

		let targets = [];
		const entitiesAtLocation = user.map.getEntitiesAt(x, y);
		if (entitiesAtLocation) {
			entitiesAtLocation.forEach(entity => {
				if (entity.hasGroup("Actor") && entity.hasMixin("Destructible")) {
					targets.push(entity);
				}
			});
		}

		if (targets.length === 0) {
			throw new ImpossibleError("You must select an enemy to target.");
		}

		targets.forEach(target => {
			if (target === user) {
				throw new ImpossibleError("You cannot confuse yourself!");
			}
			new ApplyStatusEffectAction(target, "confused", item.numberOfTurns).perform();
			user.map.game.messageLog.addMessage("The eyes of the " + target.name + " look vacant, as it starts to stumble around!", Colors.StatusEffectApplied);
		});

		if (item.hasMixin("Consumable") && user.hasMixin("InventoryHolder")) {
			item.consume(user);
		}

		new ChangeViewAction(user, ScreenDefinitions.MainGame).perform();

		user.map.game.refresh();
	}
}

// TODO: the variables added by mixins should be uniquely named so they don't overwrite each other
// damage and radius are too generic
EntityMixins.BurnAreaItem = {
	name: "BurnAreaItem",
	group: "Item",

	init({
		damage,
		radius
	} = {}) {

		this.damage = damage;
		this.radius = radius;
	},

	activateItem(user) {

		this.map.game.switchScreen(ScreenDefinitions.AreaRangedAttack, this, user);

		this.map.game.screen.setCallback(this.applyEffect);
	},

	applyEffect(item, user, x, y) {

		if (!user.map.isTileVisible(x, y)) {
			throw new ImpossibleError("You cannot target an area that you cannot see.");
		}

		let targets = [];
		const entitiesAtLocation = user.map.getAllEntities();

		entitiesAtLocation.forEach(entity => {
			if (entity.hasGroup("Actor") && entity.hasMixin("Destructible")) {
				if (entity.getDistanceFrom(x, y) <= item.radius) {
					targets.push(entity);
				}
			}
		});

		if (targets.length === 0) {
			throw new ImpossibleError("There are no targets in the radius.");
		}

		targets.forEach(target => {
			target.takeDamage(item.damage);
			const hitMessage = "The " + target.name + " is engulfed in a fiery explosion, taking " + item.damage + " damage!";
			user.map.game.messageLog.addMessage(hitMessage);
		});

		if (item.hasMixin("Consumable") && user.hasMixin("InventoryHolder")) {
			item.consume(user);
		}

		new ChangeViewAction(user, ScreenDefinitions.MainGame).perform();

		user.map.game.refresh();
	}
}

EntityMixins.Equippable = {
	name: "Equippable",
	group: "Item",

	init({
		equipmentType,
		powerBonus = 0,
		defenseBonus = 0
	} = {}) {

		this.equipmentType = equipmentType;
		this.powerBonus = powerBonus;
		this.defenseBonus = defenseBonus;
	}
}

EntityMixins.Equipper = {
	name: "Equipper",

	init({
		weapon = null,
		armor = null
	} = {}) {

		this.weapon = weapon;
		this.armor = armor;
	},

	getDefenseBonus() {

		let bonus = 0;

		if (this.weapon) {
			bonus += this.weapon.defenseBonus;
		}

		if (this.armor) {
			bonus += this.armor.defenseBonus;
		}

		return bonus;
	},

	getPowerBonus() {

		let bonus = 0;

		if (this.weapon) {
			bonus += this.weapon.powerBonus;
		}

		if (this.armor) {
			bonus += this.armor.powerBonus;
		}

		return bonus;
	},

	isEquipped(item) {

		if (item === this.weapon) {
			return true;
		}

		if (item === this.armor) {
			return true;
		}

		return false;
	},

	equip(item, addMessage) {

		let itemEquipped = false;

		if (item.equipmentType === EquipmentTypes.Weapon) {

			if (this.weapon) {
				this.unequip(this.weapon);
			}

			this.weapon = item;
			itemEquipped = true;
		}

		if (item.equipmentType === EquipmentTypes.Armor) {

			if (this.armor) {
				this.unequip(this.armor);
			}

			this.armor = item;
			itemEquipped = true;
		}

		if (itemEquipped && addMessage) {
			this.map.game.messageLog.addMessage("You equip the " + item.name);
		}
	},

	unequip(item, addMessage) {

		let itemUnequiped = false;

		if (item === this.weapon) {
			this.weapon = null;
			itemUnequiped = true;
		}

		if (item === this.armor) {
			this.armor = null;
			itemUnequiped = true;
		}

		if (itemUnequiped && addMessage) {
			this.map.game.messageLog.addMessage("You remove the " + item.name);
		}
	},

	toggleEquip(item, addMessage) {

		if (item.hasMixin("Equippable")) {
			if (this.isEquipped(item)) {
				this.unequip(item, addMessage);
			} else {
				this.equip(item, addMessage);
			}
		}
	}
}
