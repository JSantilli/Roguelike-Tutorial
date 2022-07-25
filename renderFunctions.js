'use strict';

import { Colors } from "./colors.js";

export function renderHealthBar(display, currentValue, maximumValue, totalWidth) {

	drawBar(display, 0, 45, totalWidth, Colors.BarEmpty);

	const barWidth = Math.floor((currentValue / maximumValue) * totalWidth);
	if (barWidth > 0) {
		drawBar(display, 0, 45, barWidth, Colors.BarFilled);
	}

	const barText = "HP: " + currentValue + "/" + maximumValue;
	for (let i = 0; i < barText.length; i++) {
		const character = barText[i];
		display.drawOver(i + 1, 45, character, Colors.BarText);
	}
}

function drawBar(display, x, y, width, color) {

	const rowString = "%c{" + color + "}%b{" + color + "}" + ".".repeat(width);
	display.drawText(x, y, rowString);
}

export function drawFrame(display, x, y, width, height, color = Colors.White, transparent = false) {

	// const decoration = "┌─┐│ │└─┘";
	
	const decoration = "╭─╮│ │╰─╯";

	if (transparent) {
		display.drawOver(x, y, decoration.charAt(0), color);

		for (let i = 1; i < width - 1; i++) {
			display.drawOver(x + i, y, decoration.charAt(1), color);
		}

		display.drawOver(x + width - 1, y, decoration.charAt(2), color);
	} else {
		const firstRow = "%c{" + color + "}" + decoration.charAt(0) + decoration.charAt(1).repeat(width - 2) + decoration.charAt(2);
		display.drawText(x, y, firstRow);
	}

	for (let i = 1; i < height - 1; i++) {
		if (transparent) {
			display.drawOver(x, y + i, decoration.charAt(3), color);
			display.drawOver(x + width - 1, y + i, decoration.charAt(3), color);
		} else {
			const middleRow = "%c{" + color + "}" + decoration.charAt(3) + decoration.charAt(4).repeat(width - 2) + decoration.charAt(5);
			display.drawText(x, y + i, middleRow);
		}
	}

	if (transparent) {
		display.drawOver(x, y + height - 1, decoration.charAt(6), color);

		for (let i = 1; i < width - 1; i++) {
			display.drawOver(x + i, y + height - 1, decoration.charAt(1), color);
		}

		display.drawOver(x + width - 1, y + height - 1, decoration.charAt(8), color);
	} else {
		const lastRow = "%c{" + color + "}" + decoration.charAt(6) + decoration.charAt(7).repeat(width - 2) + decoration.charAt(8);
		display.drawText(x, y + height - 1, lastRow);
	}
}

export function drawCenteredText(display, x, y, width, text, color = Colors.White) {

	const textStart = Math.floor(x + (width / 2) - Math.min(text.length / 2, width / 2));
	display.drawText(textStart, y, "%c{" + color + "}" + text, width);
}

export function clearLine(display, x, y, width = display.getOptions().width - x) {

	display.drawText(x, y, " ".repeat(width));
}

export function drawPopup(display, text) {

	const width = 20;
	const height = 11;

	const x = Math.floor(display.getOptions().width / 2 - width / 2);
	const y = Math.floor(display.getOptions().height / 2 - height / 2);

	drawFrame(display, x, y, width, height);

	drawCenteredText(display, x + 1, Math.floor(y + height / 2), width - 2, text);
}
