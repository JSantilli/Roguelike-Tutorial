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

Color.White = new Color(255, 255, 255);
Color.Black = new Color(0, 0, 0);

Color.PlayerAttack = new Color(224, 224, 224);
Color.EnemyAttack = new Color(255, 192, 192);

Color.PlayerDie = new Color(255, 48, 48);
Color.EnemyDie = new Color(255, 160, 48);

Color.WelcomeText = new Color(32, 160, 255);

Color.BarText = Color.White;
Color.BarFilled = new Color(0, 96, 0);
Color.BarEmpty = new Color(64, 16, 16);

// TODO: it will probably be better to use the ROT.js color functions
