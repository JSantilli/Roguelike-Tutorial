'use strict';

import { Color } from "./color.js";

export function renderHealthBar(display, currentValue, maximumValue, totalWidth) {

	drawBar(display, 0, 45, totalWidth, Color.BarEmpty.colorStr);

	const barWidth = Math.floor((currentValue / maximumValue) * totalWidth);
	if (barWidth > 0) {
		drawBar(display, 0, 45, barWidth, Color.BarFilled.colorStr);
	}

	const barText = "HP: " + currentValue + "/" + maximumValue;
	for (let i = 0; i < barText.length; i++) {
		const character = barText[i];
		display.drawOver(i + 1, 45, character, Color.BarText.colorStr);
	}
}

function drawBar(display, x, y, width, color) {
	
	const rowString = "%c{" + color + "}%b{" + color + "}" + ".".repeat(width);
	display.drawText(x, y, rowString);
}

export function drawFrame(display, x, y, width, height) {
	
	const decoration = "┌─┐│ │└─┘";

	const firstRow = decoration.charAt(0) + decoration.charAt(1).repeat(width - 2) + decoration.charAt(2);
	const middleRow = decoration.charAt(3) + decoration.charAt(4).repeat(width - 2) + decoration.charAt(5);
	const lastRow = decoration.charAt(6) + decoration.charAt(7).repeat(width - 2) + decoration.charAt(8);

	display.drawText(x, y, firstRow);

	for (let i = 1; i < height - 1; i++) {
		display.drawText(x, y + i, middleRow);
	}

	display.drawText(x, y + height - 1, lastRow);
}

export function drawCenteredText(display, x, y, width, text) {

	const textStart = Math.floor(x + (width / 2) - (text.length / 2));
	display.drawText(textStart, y, text);
}
