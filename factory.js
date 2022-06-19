'use strict';

export class Factory {

	type;
	templates;

	game;

	constructor(type, game) {
		this.type = type;
		this.templates = {};
		
		this.game = game;
	}

	define(name, template) {
		this.templates[name] = template;
	}

	create(name, x, y) {
		let template = this.templates[name];
		if (!template) {
			// A template by this name doesn't exist
			return;
		}
		let thing = new this.type(template); // TODO: thing seems like a terrible name
		thing.setPosition(x, y);
		return thing;
	}
}
