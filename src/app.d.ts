// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
///<reference path="../node_modules/pixi-viewport/dist/global.d.ts" />

import type { Container } from "pixi.js";

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'pixi.js' {
	interface Graphics {
		__oldParent?: Container | null;
	}
}

export { };