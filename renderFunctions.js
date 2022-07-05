'use strict';

import { Color } from "./color.js";

export function renderHealthBar(display, currentValue, maximumValue, totalWidth) {

	drawRectangle(display, 0, 45, totalWidth, Color.BarEmpty.colorStr);

	const barWidth = Math.floor((currentValue / maximumValue) * totalWidth);
	if (barWidth > 0) {
		drawRectangle(display, 0, 45, barWidth, Color.BarFilled.colorStr);
	}

	const barText = "HP: " + currentValue + "/" + maximumValue;
	for (let i = 0; i < barText.length; i++) {
		const character = barText[i];
		display.drawOver(i + 1, 45, character, Color.BarText.colorStr);
	}
}

// TODO: I might need to add a way to change the height of the rectangle
function drawRectangle(display, x, y, width, color) {
	const rowString = "%c{" + color + "}%b{" + color + "}" + ".".repeat(width);
	display.drawText(x, y, rowString);
}
