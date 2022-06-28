'use strict';

import { Color } from "./color.js";
import { EntityMixins } from "./entityMixins.js";

export function defineEntities(factory) {

	factory.define('player',
		{
			name: "player",
			character: "@",
			foreground: new Color(255, 255, 255),
			background: new Color(200, 180, 50),
			blocksMovement: true,
			map: factory.map,
			mixins: [
				[EntityMixins.PlayerActor],
				[EntityMixins.Destructible,
					{ maxHitPoints: 30, defense: 2 }],
				[EntityMixins.Attacker,
					{ power: 5 }],
			]
		}
	);

	factory.define('orc',
		{
			name: "orc",
			character: "o",
			foreground: new Color(63, 127, 63),
			background: new Color(200, 180, 50),
			blocksMovement: true,
			map: factory.map,
			mixins: [
				[EntityMixins.MonsterActor],
				[EntityMixins.Destructible,
					{ maxHitPoints: 10, defense: 0 }],
				[EntityMixins.Attacker,
					{ power: 3 }],
			]
		}
	);

	factory.define('troll',
		{
			name: "troll",
			character: "T",
			foreground: new Color(0, 127, 0),
			background: new Color(200, 180, 50),
			blocksMovement: true,
			map: factory.map,
			mixins: [
				[EntityMixins.MonsterActor],
				[EntityMixins.Destructible,
					{ maxHitPoints: 16, defense: 1 }],
				[EntityMixins.Attacker,
					{ power: 4 }],
			]
		}
	);
}
