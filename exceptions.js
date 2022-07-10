'use strict';

export class ImpossibleError extends Error {

	constructor(message) {
		super(message);

		this.name = "ImpossibleError";
	}
};
