'use strict';

class Action {}

export class EscapeAction extends Action {}

export class MovementAction extends Action {
	constructor(dx, dy) {
		super();

		this.dx = dx;
		this.dy = dy;
	}
}
