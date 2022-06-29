'use strict';

import { defineEntities } from "./entities.js";
import { Entity } from "./entity.js";
import { EventHandler } from "./eventHandler.js";
import { Factory } from "./factory.js";
import { generateDungeon, placeEntities } from "./procgen.js";

export class Game {

	screen_width;
	screen_height;

	map_width;
	map_height;
	
	display;
	scheduler;
	engine;
	
	eventHandler;
	
	map;
	maxMonstersPerRoom; // TODO: does this really need to be defined on the Game?

	entityFactory;

	constructor() {
		this.screen_width = 80;
		this.screen_height = 50;

		this.map_width = 80;
		this.map_height = 45;

		this.maxMonstersPerRoom = 2;

		const displayOptions = {
			width: this.screen_width,
			height: this.screen_height,
			forceSquareRatio: true
		}

		this.display = new ROT.Display(displayOptions);
		document.body.appendChild(this.display.getContainer());

		this.scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(this.scheduler);
	}

	start() {

		this.eventHandler = new EventHandler(this);

		this.map = generateDungeon(this.map_width, this.map_height);
		this.map.setGame(this);

		this.entityFactory = new Factory(Entity, this.map);
		defineEntities(this.entityFactory);

		placeEntities(this.map, this.maxMonstersPerRoom, this.entityFactory, this.scheduler);

		this.engine.start();
		this.refresh();
	}

	refresh() {
		this.display.clear();
		this.map.render(this.display);
	}
}
