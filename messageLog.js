'use strict';

import { Colors } from "./colors.js";
import { Message } from "./message.js";

export class MessageLog {

	// TODO: this applies everywhere, but I can declare private member variable like
	// #messages = [];
	// both to declare a default value and make it an error to access #messages outside the class.
	messages;

	constructor() {
		this.messages = [];

	}

	getLength() {
		return this.messages.length;
	}

	addMessage(text, foreground = Colors.White, stack = true) {

		// TODO: I hate this long if condition, but I can't come up with a clean way to refactor it yet.
		if (
			stack &&
			this.messages.length > 0 &&
			text === this.messages[this.messages.length - 1].text
		) {
			this.messages[this.messages.length - 1].count += 1;
		} else {
			this.messages.push(new Message(text, foreground));
		}
	}

	render(display, x, y, width, height, messageOffset = 0) {

		let yOffset = height;

		const startingMessageIndex = this.messages.length - messageOffset - 1;

		// Loop over messages in reverse to print the latest message first
		for (let i = startingMessageIndex; i >= 0; i--) {
			const message = this.messages[i];

			const [textToDraw, linesToDraw] = this.getTruncatedMessage(message.getFullText(), yOffset, width);

			yOffset -= linesToDraw;

			display.drawText(x, y + yOffset, textToDraw, width);

			if (yOffset <= 0) {
				break;
			}
		}
	}

	getTruncatedMessage(messageText, linesAvailable, width) {

		let textToDraw = messageText;
		let linesToDraw = ROT.Text.measure(textToDraw, width).height;

		let count = 0;
		while (linesToDraw > linesAvailable) {
			const messageTokens = ROT.Text.tokenize(textToDraw, width);

			// Remove every type 0 token before the first type 1 token
			for (const token of messageTokens) {
				if (token.type === 0) { // Text tokens
					textToDraw = textToDraw.replace(token.value, "");
				} else if (token.type === 1) { // New line tokens
					break;
				}
			}

			linesToDraw = ROT.Text.measure(textToDraw, width).height;

			count++;
			if (count > 100) {
				console.log("Tried to truncate message >100 times.");
				break;
			}
		}

		return [textToDraw, linesToDraw];
	}
}
