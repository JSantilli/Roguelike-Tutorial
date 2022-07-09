'use strict';

export class Screen {

	game;

	eventHandler;

	init;

	render;

	exit;

	constructor(game,
		{
			eventHandlerClass,
			init,
			render,
			exit
		}
	) {
		this.game = game;
		this.eventHandler = new eventHandlerClass(this.game);
		this.init = init;
		this.render = render;
		this.exit = exit;
	}
}
