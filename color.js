'use strict';

export class Color {
	constructor(r, g, b, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
		this.colorStr = "rgba(" + [this.r, this.g, this.b, this.a].join(", ") + ")";
	}
}
