'use strict';

export class Factory {

	type;
	templates;

	map;

	constructor(type, map) {
		this.type = type;
		this.templates = {};
		
		this.map = map;
	}

	define(name, template) {
		this.templates[name] = template;
	}

	create(name, x, y) {
		const template = this.templates[name];
		if (!template) {
			// A template by this name doesn't exist
			return;
		}
		const instance = new this.type(template);
		instance.setPosition(x, y);
		return instance;
	}
}
