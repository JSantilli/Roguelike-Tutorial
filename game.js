'use strict';

import { Colors } from "./colors.js";
import { defineEntities } from "./entities.js";
import { Entity } from "./entity.js";
import { Factory } from "./factory.js";
import { InputHandler } from "./inputHandler.js";
import { MessageLog } from "./messageLog.js";
import { generateDungeon, placeEntities } from "./procgen.js";
import { renderHealthBar } from "./renderFunctions.js";
import { Screen } from "./screen.js";
import { ScreenDefinitions } from "./screens.js";

export class Game {

	screenWidth;
	screenHeight;

	// TODO: these should just belong to map, not game
	mapWidth;
	mapHeight;
	
	display;
	messageLog;
	scheduler;
	engine;
	inputHandler

	screen;
	
	map;

	// TODO: do these really need to be defined on the Game?
	maxMonstersPerRoom;
	maxItemsPerRoom;

	entityFactory;

	constructor() {

		this.screenWidth = 80;
		this.screenHeight = 50;

		this.mapWidth = 80;
		this.mapHeight = 43;

		this.maxMonstersPerRoom = 2;
		this.maxItemsPerRoom = 2;

		const displayOptions = {
			width: this.screenWidth,
			height: this.screenHeight,
			forceSquareRatio: true
		}

		this.display = new ROT.Display(displayOptions);
		const displayElement = document.body.appendChild(this.display.getContainer());
		// TODO: I need to set this in a css file, not in js
		displayElement.style = "position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; margin:auto;";

		this.inputHandler = new InputHandler(this);

		this.switchScreen(ScreenDefinitions.MainMenu);
	}

	start() {

		this.scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(this.scheduler);

		this.map = generateDungeon(this.mapWidth, this.mapHeight);
		this.map.setGame(this);

		this.entityFactory = new Factory(Entity);
		defineEntities(this.entityFactory);

		placeEntities(this.map, this.maxMonstersPerRoom, this.maxItemsPerRoom, this.entityFactory, this.scheduler);

		this.messageLog = new MessageLog();
		this.messageLog.addMessage("Hello and welcome, adventurer, to yet another dungeon!", Colors.WelcomeText, false);

		this.switchScreen(ScreenDefinitions.MainGame);

		this.engine.start();
	}

	refresh() {

		this.display.clear();
		this.map.render(this.display);
		this.messageLog.render(this.display, 21, 45, 40, 5);
		renderHealthBar(this.display, this.map.player.hitPoints, this.map.player.maxHitPoints, 20);
	}

	switchScreen(screenDefinition, item = null, user = null) {

		if (this.screen) {
			this.screen.exit();
		}
		this.screen = new Screen(this, screenDefinition);
		this.screen.init();
		
		if (item && user) {
			this.screen.setItemAndUser(item, user);
		}

		this.screen.render();
	}
}
