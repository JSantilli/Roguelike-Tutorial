'use strict';

import { Color } from "./color.js";
import { Entity } from "./entity.js";
import { EventHandler } from "./eventHandler.js";
import { Map } from "./map.js";
import { Player } from "./player.js";
import { generateDungeon } from "./procgen.js";

export class Game {

	screen_width;
	screen_height;
	map_width;
	map_height;
	display;
	scheduler;
	engine;
	player;
	eventHandler;
	entities;
	map;

	constructor() {
		this.screen_width = 80;
		this.screen_height = 50;

		this.map_width = 80;
		this.map_height = 45;

		let displayOptions = {
			width: this.screen_width,
			height: this.screen_height,
			forceSquareRatio: true
		}

		this.display = new ROT.Display(displayOptions);
		document.body.appendChild(this.display.getContainer());

		this.scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(this.scheduler);

		let x = Math.floor(this.screen_width / 2);
		let y = Math.floor(this.screen_height / 2);

		this.player = new Player(x, y, "@", new Color(255, 255, 255), new Color(200, 180, 50), this);
		let npc = new Entity(x - 5, y, "@", new Color(255, 255, 0), new Color(200, 180, 50), this);
		
		this.eventHandler = new EventHandler(this);

		this.scheduler.add(this.player, true);
		this.scheduler.add(npc, true);

		this.entities = new Set([this.player, npc]);

		this.map = generateDungeon(this.map_width, this.map_height, this.player, this.entities);

		this.engine.start();

		this.refresh();
	}

	refresh() {
		this.display.clear();
		this.map.render(this.display);
	}
}
