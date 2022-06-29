'use strict';

import { Color } from "./color.js";
import { EntityMixins } from "./entityMixins.js";

/* 
TODO: rather than this being a function that calls a function a bunch of times individually for each thing I want to define, this should just be:

* just a file of json objects
* some other function can read in this set of json objects and pass them into the factory define function
* or better yet, the factory.define() function should just take in a whole bunch of json objects and be done
* it can take the name property of the json object and use that as the 'key' for the factory

*/
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
