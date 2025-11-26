<script lang="ts" module>
	import { setContext, type Snippet } from 'svelte';
	import { Viewport } from 'pixi-viewport';

	export interface ViewPortProps {
		children?: Snippet;
		grid?: Grid;
		enablePan?: boolean;
		toolboxItems : ToolboxItem[];
	}
</script>

<script lang="ts">
	import ContainerElement from '../container-element.svelte';
	import { getAppContext, getContainerContext } from '../context.svelte.ts';
	import type { ContainerContext, ToolboxItem, ViewportContext } from '../types.ts';
	import { Container } from 'pixi.js';
	import { Grid } from '../grid.svelte.ts';
	import { browser } from '$app/environment';
	import { watch } from 'runed';

	let { children, grid = $bindable(), enablePan , toolboxItems }: ViewPortProps = $props();

	let context = $state<ContainerContext>({} as ContainerContext);
	let viewportContext = $state<ViewportContext>({} as ViewportContext);

	setContext('viewport-context', viewportContext);

	grid = new Grid({
		size: 50,
		lineColor: '#444'
	});

	const appContext = getAppContext();

	let viewport: Viewport;

	function handleResize() {
		if (appContext) {
			setTimeout(() => {
				viewport.resize(appContext.app.renderer.width, appContext.app.renderer.height);
				grid?.redrawGrid();
			}, 0);
		}
	}

	const containerContext = getContainerContext();

	toolboxItems.forEach(e => e.handler());

	$effect(() => {
		(async () => {
			if (containerContext?.container && appContext?.app) {
				const app = appContext.app;

				viewport = new Viewport({
					screenWidth: app.screen.width,
					screenHeight: app.screen.height,
					worldWidth: 1e6,
					worldHeight: 1e6,
					events: app.renderer.events
					//interaction: app.renderer.plugins.interaction
				});

				if (browser) {
					window.addEventListener('resize', handleResize);
				}

				viewportContext.viewort = viewport;

				app.stage.addChild(viewport);

				viewport.drag().pinch().wheel({ smooth: 4 }).decelerate();

				const world = new Container();
				viewport.addChild(world);
				context.container = world;
			}
		})();

		watch(
			() => enablePan,
			(enablePan) => {
				if (!viewport) {
					return;
				}
				
				if (!enablePan) {
					viewport.plugins.pause('drag');
				} else {
					viewport.plugins.resume('drag');
				}
			}
		);

		return () => {
			if (browser) {
				window.removeEventListener('resize', handleResize);
			}
		};
	});
</script>

<ContainerElement {children} {context} />
