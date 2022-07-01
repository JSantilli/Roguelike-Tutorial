'use strict';

import { Color } from "./color.js";
import { EntityMixins } from "./entityMixins.js";

// TODO: maybe this ends up being a raw json file instead of json being defined in a list?

const entityTemplates = [

{
	name: "player",
	character: "@",
	foreground: new Color(255, 255, 255),
	background: new Color(200, 180, 50),
	blocksMovement: true,
	mixins: [
		[EntityMixins.PlayerActor],
		[EntityMixins.Destructible,
		{ maxHitPoints: 30, defense: 2 }],
		[EntityMixins.Attacker,
		{ power: 5 }],
	]
},

{
	name: "orc",
	character: "o",
	foreground: new Color(63, 127, 63),
	background: new Color(200, 180, 50),
	blocksMovement: true,
	mixins: [
		[EntityMixins.HostileEnemy],
		[EntityMixins.Destructible,
		{ maxHitPoints: 10, defense: 0 }],
		[EntityMixins.Attacker,
		{ power: 3 }],
	]
},

{
	name: "troll",
	character: "T",
	foreground: new Color(0, 127, 0),
	background: new Color(200, 180, 50),
	blocksMovement: true,
	mixins: [
		[EntityMixins.HostileEnemy],
		[EntityMixins.Destructible,
		{ maxHitPoints: 16, defense: 1 }],
		[EntityMixins.Attacker,
		{ power: 4 }],
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
