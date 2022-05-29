'use strict';

import { EscapeAction, MovementAction } from "./actions.js";

export class EventHandler {

	ev_keydown(e) {

		let action;

		let key = e.keyCode;

		if (key == ROT.KEYS.VK_UP) {
			action = new MovementAction(0, -1);
		} else if (key == ROT.KEYS.VK_DOWN) {
			action = new MovementAction(0, 1);
		} else if (key == ROT.KEYS.VK_LEFT) {
			action = new MovementAction(-1, 0);
		} else if (key == ROT.KEYS.VK_RIGHT) {
			action = new MovementAction(1, 0);
		} else if (key == ROT.KEYS.VK_ESCAPE) {
			action = new EscapeAction();
		}

		return action;
	}
}
