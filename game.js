'use strict';

import { Colors } from "./colors.js";
import { defineEntities } from "./entities.js";
import { Entity } from "./entity.js";
import { Factory } from "./factory.js";
import { InputHandler } from "./inputHandler.js";
import { MessageLog } from "./messageLog.js";
import { generateDungeon, placeEntities } from "./procgen.js";
import { drawPopup, renderHealthBar } from "./renderFunctions.js";
import { Screen } from "./screen.js";
import { ScreenDefinitions } from "./screens.js";
import { Tile } from "./tile.js";

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

	saveGame() {

		/*
		To save a game we need to store:

			* The map
				* Width, height
				* All of the tiles in the current map
					* This should be some simple representation of a tile
					* When we load this back, we don't want to create new tiles to rebuild the map,
					* 	we just need to set each index of the tiles array to the proper Tile as defined in tile.js
				* Explored tiles
				* All entities on the map
					* I think we need to store all info on the Entity object (except map),
					*	because we don't want to track all of the weird member variables a mixin might add,
					*	and we need to know the exact state of any of those variables to load them back into the proper state.
					*	(E.g. an Entity with the "Destructible" mixin has a hitPoints variable, which must be tracked across saves)
		*/

		const savedTiles = [];

		this.map.tiles.forEach(mapColumn => {
			const savedColumn = [];
			mapColumn.forEach(tile => {
				if (tile === Tile.FloorTile) {
					savedColumn.push(0);
				}

				else if (tile === Tile.WallTile) {
					savedColumn.push(1);
				}

				else {
					savedColumn.push(null);
				}
			});
			savedTiles.push(savedColumn);
		});

		const savedEntities = {};

		for (const [key, entitySet] of Object.entries(this.map.entities)) {
			if (entitySet && entitySet.size > 0) {
				savedEntities[key] = Array.from(entitySet)
			}
		}

		const savedMap = {

			width: this.map.width,
			height: this.map.height,

			tiles: savedTiles,
			explored: this.map.explored,

			entities: savedEntities
		};

		const ignoreMap = (key, value) => {
			
			if (key === "map") return undefined;
			return value;
		}

		const saveString = JSON.stringify(savedMap, ignoreMap);

		localStorage.setItem("savedMap", saveString);

		drawPopup(this.display, "Game saved");
	}
}
