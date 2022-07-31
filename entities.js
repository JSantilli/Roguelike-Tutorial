'use strict';

import { Colors } from "./colors.js";
import { EntityMixins } from "./entityMixins.js";
import { EquipmentTypes } from "./equipmentTypes.js";
import { RenderOrder } from "./renderOrder.js";

// TODO: maybe this ends up being a raw json file instead of json being defined in a list?

const entityTemplates = [

	{
		name: "player",
		character: "@",
		foreground: Colors.Player,
		background: Colors.PlayerBG,
		renderOrder: RenderOrder.Alive,
		blocksMovement: true,
		mixins: [
			[EntityMixins.PlayerActor],
			[EntityMixins.Destructible,
			{ maxHitPoints: 30, baseDefense: 1 }],
			[EntityMixins.Attacker,
			{ basePower: 2 }],
			[EntityMixins.InventoryHolder,
			{ inventoryCapacity: 26 }],
			[EntityMixins.ExperienceGainer,
			{ levelUpBase : 200 }],
			[EntityMixins.Equipper]
		]
	},

	{
		name: "orc",
		character: "o",
		foreground: Colors.Orc,
		background: Colors.OrcBG,
		renderOrder: RenderOrder.Alive,
		blocksMovement: true,
		mixins: [
			[EntityMixins.HostileEnemy],
			[EntityMixins.Destructible,
			{ maxHitPoints: 10, baseDefense: 0 }],
			[EntityMixins.Attacker,
			{ basePower: 3 }],
			[EntityMixins.InventoryHolder,
			{ inventoryCapacity: 0 }],
			[EntityMixins.ExperienceGiver,
			{ xpGiven : 35 }],
			[EntityMixins.Equipper]
		]
	},

	{
		name: "troll",
		character: "T",
		foreground: Colors.Troll,
		background: Colors.TrollBG,
		renderOrder: RenderOrder.Alive,
		blocksMovement: true,
		mixins: [
			[EntityMixins.HostileEnemy],
			[EntityMixins.Destructible,
			{ maxHitPoints: 16, baseDefense: 1 }],
			[EntityMixins.Attacker,
			{ basePower: 4 }],
			[EntityMixins.InventoryHolder,
			{ inventoryCapacity: 0 }],
			[EntityMixins.ExperienceGiver,
			{ xpGiven : 100 }],
			[EntityMixins.Equipper]
		]
	},

	{
		name: "Health Potion",
		character: "!",
		foreground: Colors.HealthPotion,
		background: Colors.HealthPotionBG,
		renderOrder: RenderOrder.Item,
		blocksMovement: false,
		mixins: [
			[EntityMixins.HealingItem,
			{ healingAmount: 4 }],
			[EntityMixins.Consumable]
		]
	},

	{
		name: "Lightning Scroll",
		character: "~",
		foreground: Colors.LightningScroll,
		background: Colors.LightningScrollBG,
		renderOrder: RenderOrder.Item,
		blocksMovement: false,
		mixins: [
			[EntityMixins.LightningDamageItem,
			{ damage: 20, maximumRange: 5 }],
			[EntityMixins.Consumable]
		]
	},

	{
		name: "Confusion Scroll",
		character: "~",
		foreground: Colors.ConfusionScroll,
		background: Colors.ConfusionScrollBG,
		renderOrder: RenderOrder.Item,
		blocksMovement: false,
		mixins: [
			[EntityMixins.ConfusionItem,
			{ numberOfTurns: 10 }],
			[EntityMixins.Consumable]
		]
	},

	{
		name: "Fireball Scroll",
		character: "~",
		foreground: Colors.FireballScroll,
		background: Colors.FireballScrollBG,
		renderOrder: RenderOrder.Item,
		blocksMovement: false,
		mixins: [
			[EntityMixins.BurnAreaItem,
			{ damage: 12, radius: 3 }],
			[EntityMixins.Consumable]
		]
	},

	{
		name: "Dagger",
		character: "/",
		foreground: Colors.Weapon,
		background: Colors.WeaponBG,
		renderOrder: RenderOrder.Item,
		blocksMovement: false,
		mixins: [
			[EntityMixins.Equippable,
			{ equipmentType: EquipmentTypes.Weapon, powerBonus: 2 }]
		]
	},

	{
		name: "Sword",
		character: "/",
		foreground: Colors.Weapon,
		background: Colors.WeaponBG,
		renderOrder: RenderOrder.Item,
		blocksMovement: false,
		mixins: [
			[EntityMixins.Equippable,
			{ equipmentType: EquipmentTypes.Weapon, powerBonus: 4 }]
		]
	},

	{
		name: "Leather Armor",
		character: "[",
		foreground: Colors.Armor,
		background: Colors.ArmorBG,
		renderOrder: RenderOrder.Item,
		blocksMovement: false,
		mixins: [
			[EntityMixins.Equippable,
			{ equipmentType: EquipmentTypes.Armor, defenseBonus: 1 }]
		]
	},

	{
		name: "Chain Mail",
		character: "[",
		foreground: Colors.Armor,
		background: Colors.ArmorBG,
		renderOrder: RenderOrder.Item,
		blocksMovement: false,
		mixins: [
			[EntityMixins.Equippable,
			{ equipmentType: EquipmentTypes.Armor, defenseBonus: 3 }]
		]
	},
];

/* 
Unrelated idea, what if instead of these static definitions of creatures or monsters
every enemy was totally randomly generated from a set of mixins

Have a large set of behaviors that can be 'randomly' pulled in to create a new monster that no one has ever seen before
*/

export function defineEntities(factory) {
	factory.importDefinitions(entityTemplates);
}
