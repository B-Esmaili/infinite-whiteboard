<script lang="ts" module>
	import { setContext, type Snippet } from 'svelte';
	import { Viewport } from 'pixi-viewport';

	export interface ViewPortProps {
		children?: Snippet;
		grid?: Grid;
	}
</script>

<script lang="ts">
	import ContainerElement from '../container-element.svelte';
	import { getAppContext, getContainerContext } from '../context.svelte.ts';
	import type { ContainerContext, ViewportContext } from '../types.ts';
	import { Container } from 'pixi.js';
	import { Grid } from '../grid.svelte.ts';

	let { children, grid = $bindable() }: ViewPortProps = $props();

	let context = $state<ContainerContext>({} as ContainerContext);
	let viewportContext = $state<ViewportContext>({} as ViewportContext);

	setContext('viewport-context', viewportContext);

	grid = new Grid({
		size: 50
	});

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

				viewportContext.viewort = viewport;

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
