'use strict';

import { Colors } from "./colors.js";
import { defineEntities } from "./entities.js";
import { Entity } from "./entity.js";
import { EntityMixins } from "./entityMixins.js";
import { Factory } from "./factory.js";
import { InputHandler } from "./inputHandler.js";
import { Map } from "./map.js";
import { MessageLog } from "./messageLog.js";
import { drawPopup, renderDungeonLevel, renderHealthBar } from "./renderFunctions.js";
import { Screen } from "./screen.js";
import { ScreenDefinitions } from "./screens.js";
import { Tile } from "./tile.js";
import { World } from "./world.js";

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
	
	player;

	map;

	roomMinSize;
	roomMaxSize;

	entityFactory;

	constructor() {

		this.screenWidth = 80;
		this.screenHeight = 50;

		this.mapWidth = 80;
		this.mapHeight = 43;

		this.roomMinSize = 6;
		this.roomMaxSize = 10;

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

		this.scheduler = new ROT.Scheduler.Simple();
		this.engine = new ROT.Engine(this.scheduler);

		this.entityFactory = new Factory(Entity);
		defineEntities(this.entityFactory);

		this.switchScreen(ScreenDefinitions.MainMenu);
	}

	start(savedMap = null) {

		this.world = new World(this, this.mapWidth, this.mapHeight, this.roomMinSize, this.roomMaxSize);

		if (savedMap) {
			this.loadMap(savedMap);
		} else {
			this.createNewMap();
		}

		this.messageLog = new MessageLog();
		this.messageLog.addMessage("Hello and welcome, adventurer, to yet another dungeon!", Colors.WelcomeText, false);

		const startingDagger = this.entityFactory.create("Dagger", this.map, 0, 0);
		const startingLeatherArmor = this.entityFactory.create("Leather Armor", this.map, 0, 0);

		this.map.removeEntity(startingDagger);
		this.map.player.inventory.push(startingDagger);
		this.map.player.toggleEquip(startingDagger, false);
		
		this.map.removeEntity(startingLeatherArmor);
		this.map.player.inventory.push(startingLeatherArmor);
		this.map.player.toggleEquip(startingLeatherArmor, false);

		this.switchScreen(ScreenDefinitions.MainGame);

		this.engine.start();
	}

	createNewMap() {

		this.world.generateFloor();
	}

	loadMap(savedMap) {

		this.map = new Map(savedMap.width, savedMap.height);

		for (let x = 0; x < savedMap.tiles.length; x++) {
			for (let y = 0; y < savedMap.tiles[x].length; y++) {
				const tile = savedMap.tiles[x][y];
				
				if (tile === 0) {
					this.map.tiles[x][y] = Tile.FloorTile;
				}
			}
		}

		this.map.setGame(this);

		this.map.explored = savedMap.explored;

		savedMap.entities.forEach(entity => {
			this.loadEntity(entity);			
		});
	}

	loadEntity(entity) {

		const mixins = [];

		if (entity.mixins["PlayerActor"]) {
			mixins.push([EntityMixins.PlayerActor]);
		}

		if (entity.mixins["HostileEnemy"]) {
			mixins.push(
				[EntityMixins.HostileEnemy,
				{
					statuses: entity.statuses
				}]
			);
		}

		if (entity.mixins["Destructible"]) {
			mixins.push(
				[EntityMixins.Destructible,
				{
					maxHitPoints: entity.maxHitPoints,
					hitPoints: entity.hitPoints,
					baseDefense: entity.baseDefense,
					isAlive: entity.isAlive
				}]
			);
		}

		if (entity.mixins["Attacker"]) {
			mixins.push(
				[EntityMixins.Attacker,
				{
					basePower: entity.basePower
				}]
			);
		}

		if (entity.mixins["InventoryHolder"]) {

			const inventory = [];

			entity.inventory.forEach(heldEntity => {
				inventory.push(this.loadEntity(heldEntity));
			});

			mixins.push(
				[EntityMixins.InventoryHolder,
				{
					inventoryCapacity: entity.inventoryCapacity,
					inventory: inventory
				}]
			);
		}

		if (entity.mixins["Consumable"]) {
			mixins.push(
				[EntityMixins.Consumable]
			);
		}

		if (entity.mixins["HealingItem"]) {
			mixins.push(
				[EntityMixins.HealingItem,
				{
					healingAmount: entity.healingAmount
				}]
			);
		}

		if (entity.mixins["LightningDamageItem"]) {
			mixins.push(
				[EntityMixins.LightningDamageItem,
				{
					damage: entity.damage,
					maximumRange: entity.maximumRange
				}]
			);
		}

		if (entity.mixins["ConfusionItem"]) {
			mixins.push(
				[EntityMixins.ConfusionItem,
				{
					numberOfTurns: entity.numberOfTurns
				}]
			);
		}

		if (entity.mixins["BurnAreaItem"]) {
			mixins.push(
				[EntityMixins.BurnAreaItem,
				{
					damage: entity.damage,
					radius: entity.radius
				}]
			);
		}

		const createdEntity = new Entity({
			name: entity.name,
			character: entity.glyph.character,
			foreground: entity.glyph.foreground,
			background: entity.glyph.background,
			renderOrder: entity.renderOrder,
			blocksMovement: entity.blocksMovement,
			mixins: mixins
		});

		createdEntity.setPosition(entity.x, entity.y, this.map);

		if (createdEntity.hasGroup("Actor")) {
			this.scheduler.add(createdEntity, true);
		}

		if (createdEntity.name === "player") {
			this.map.setPlayer(createdEntity);
			this.player = createdEntity;
		}

		return createdEntity;
	}

	refresh() {

		this.display.clear();
		this.map.render(this.display);
		this.messageLog.render(this.display, 21, 45, 40, 5);
		renderHealthBar(this.display, this.map.player.hitPoints, this.map.player.maxHitPoints, 20);
		renderDungeonLevel(this.display, this.world.currentFloor, 0, 47);
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

		const savedEntities = [];

		for (const [, entitySet] of Object.entries(this.map.entities)) {
			if (entitySet && entitySet.size > 0) {
				entitySet.forEach(entity => {
					savedEntities.push(entity);
				});
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

	loadGame() {

		const saveString = localStorage.getItem("savedMap");

		const savedMap = JSON.parse(saveString);

		this.start(savedMap);
	}
}
