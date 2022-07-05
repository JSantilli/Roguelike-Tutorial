'use strict';

export class Message {

	text;
	foreground;
	count;

	constructor(text, foreground) {
		this.text = text;
		this.foreground = foreground;
		this.count = 1;
	}

	getFullText() {

		const colorFormattedString = "%c{" + this.foreground.colorStr + "}" + this.text;
		
		if (this.count > 1) {
			return colorFormattedString + "(x" + this.count + ")"
		} else {
			return colorFormattedString;
		}
	}
}
