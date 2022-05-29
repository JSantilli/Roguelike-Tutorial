import { EscapeAction, MovementAction } from "./actions.js";
import { EventHandler } from "./input_handlers.js";

function main() {
	let screen_width = 80;
	let screen_height = 50;

	let player_x = Math.floor(screen_width / 2);
	let player_y = Math.floor(screen_height / 2);

	let tileset = document.createElement("img");
	tileset.src = "./assets/dejavu10x10_gs_tc.png";

	let displayOptions = {
		width: screen_width,
		height: screen_height,
		layout: "tile",
		tileSet: tileset,
		tileWidth: 10,
		tileHeight: 10,
		tileMap: {
			"@": [0, 10],
		},
	}

	let display = new ROT.Display(displayOptions);
	document.body.appendChild(display.getContainer());

	let event_handler = new EventHandler();

	async function engine() {
		while (true) {
			await new Promise((resolve) => setTimeout(resolve, 100));

			display.clear();
			display.draw(player_x, player_y, "@");
			
			let e = await new Promise((resolve) => {
				window.addEventListener("keydown", resolve, { once: true });
			});
			
			let action = event_handler.ev_keydown(e);

			if (action == undefined) {
				continue;
			}

			if (action instanceof MovementAction) {
				player_x += action.dx;
				player_y += action.dy;
			} else if (action instanceof EscapeAction) {
				// Nothing for now
			}
		}
	}

	engine();

}

window.onload = function() {
	main();
};
