'use strict';

import { Color } from "./color.js";

export function defineEntities(factory) {
	
	factory.define('player',
		{
			name: "player",
			character: "@",
			foreground: new Color(255, 255, 255),
			background: new Color(200, 180, 50),
			blocksMovement: true,
			game: factory.game,
			actFunction: () => { // TODO: this should be some kind of mixin
				factory.game.refresh();
				factory.game.engine.lock();
			}
		}
	);

	factory.define('orc',
		{
			name: "orc",
			character: "o",
			foreground: new Color(63, 127, 63),
			background: new Color(200, 180, 50),
			blocksMovement: true,
			game: factory.game,
			actFunction: function() {
				console.log("The " + this.name + " wonders when it will get to take a real turn.");
			}
		}
	);

	factory.define('troll',
		{
			name: "troll",
			character: "T",
			foreground: new Color(0, 127, 0),
			background: new Color(200, 180, 50),
			blocksMovement: true,
			game: factory.game,
			actFunction: function() {
				console.log("The " + this.name + " wonders when it will get to take a real turn.");
			}
		}
	);
}
