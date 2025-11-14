<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import { Viewport } from 'pixi-viewport';

	export interface ViewPortProps {
		children?: Snippet;
	}
</script>

<script lang="ts">
	import ContainerElement from '../container-element.svelte';
	import { getAppContext, getContainerContext } from '../context.svelte.ts';
	import type { ContainerContext } from '../types.ts';
	import { Container } from 'pixi.js';

	const { children }: ViewPortProps = $props();

	let context = $state<ContainerContext>({} as ContainerContext);

	$effect(() => {
		(async () => {
			const containerContext = getContainerContext();
			const appContext = getAppContext();
			if (containerContext && appContext) {
				const app = appContext.app;

				const viewport = new Viewport({
					screenWidth: app.screen.width,
					screenHeight: app.screen.height,
					worldWidth: 1e6,
					worldHeight: 1e6,
					events: app.renderer.events					
					//interaction: app.renderer.plugins.interaction
				});
				
				app.stage.addChild(viewport);

				viewport.drag().pinch().wheel({ smooth: 4 }).decelerate();

				const world = new Container();
				viewport.addChild(world);
				context.container = world;
			}
		})();
	});
</script>

<ContainerElement {children} {context} />
