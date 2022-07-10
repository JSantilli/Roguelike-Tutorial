'use strict';

export class Factory {

	type;
	templates;

	constructor(type) {
		this.type = type;
		this.templates = {};
	}

	importDefinitions(templates) {
		templates.forEach(template => {
			this.define(template);
		});
	}

	define(template) {
		this.templates[template.name] = template;
	}

	create(name, map, x, y) {
		const template = this.templates[name];
		if (!template) {
			// A template by this name doesn't exist
			return;
		}
		const instance = new this.type(template);

		// TODO: These seem a little out of place here. Should the factory be the one that sets the map and the position of an 'instance'?
		// These are concepts that instead belong to an Entity specifically. What if other 'things' are created by a factory
		// and don't require a map or position?
		instance.setPosition(x, y, map);
		
		return instance;
	}
}
