'use strict';

import { Color } from "./color.js";
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

	screen_width;
	screen_height;

	map_width;
	map_height;
	
	display;
	messageLog;
	scheduler;
	engine;
	inputHandler

	screen;
	
	map;
	maxMonstersPerRoom; // TODO: does this really need to be defined on the Game?

	entityFactory;

	constructor() {
		this.screen_width = 80;
		this.screen_height = 50;

		this.map_width = 80;
		this.map_height = 43;

		this.maxMonstersPerRoom = 2;

		const displayOptions = {
			width: this.screen_width,
			height: this.screen_height,
			forceSquareRatio: true
		}

		this.display = new ROT.Display(displayOptions);
		const displayElement = document.body.appendChild(this.display.getContainer());
		// TODO: I need to set this in a css file, not in js
		displayElement.style = "position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; margin:auto;";

		this.messageLog = new MessageLog();

		this.scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(this.scheduler);
	}

	start() {

		this.switchScreen(ScreenDefinitions.MainGame);

		this.inputHandler = new InputHandler(this);

		this.map = generateDungeon(this.map_width, this.map_height);
		this.map.setGame(this);

		this.entityFactory = new Factory(Entity);
		defineEntities(this.entityFactory);

		placeEntities(this.map, this.maxMonstersPerRoom, this.entityFactory, this.scheduler);

		for (let i = 0; i < 20; i++) {
			this.messageLog.addMessage("Hello and welcome, adventurer, to yet another dungeon!1", Color.WelcomeText, false);
			this.messageLog.addMessage("Hello and welcome, adventurer, to yet another dungeon!2", Color.WelcomeText, false);
			this.messageLog.addMessage("Hello and %c{yellow}welcome, adventurer, to yet another %c{white}dungeon!3", Color.WelcomeText, false);
			this.messageLog.addMessage("Hello and welcome, adventurer, to yet %c{red}another %c{}dungeon!4", Color.WelcomeText, false);
			this.messageLog.addMessage("Hello and welcome, adventurer, to yet another %c{red}dungeon!5", Color.WelcomeText, false);
		}

		this.engine.start();
	}

	refresh() {
		this.display.clear();
		this.map.render(this.display);
		this.messageLog.render(this.display, 21, 45, 40, 5);
		renderHealthBar(this.display, this.map.player.hitPoints, this.map.player.maxHitPoints, 20);
	}

	switchScreen(screenDefinition) {
		if (this.screen) {
			this.screen.exit();
		}
		this.screen = new Screen(this, screenDefinition);
		this.screen.init();
		this.screen.render();
	}
}
