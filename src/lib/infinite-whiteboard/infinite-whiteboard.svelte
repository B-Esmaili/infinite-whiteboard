<script lang="ts">
	import { Application } from './Application.svelte.ts';
	import { getAppContext } from './context.svelte.ts';
	import ViewPort from './elements/view-port.svelte';
	import type { Grid } from './grid.svelte.ts';
	import ToolbarView from './toolbar/toolbar-view.svelte';
	const { children } = $props();

	let container: HTMLCanvasElement | null = null;

	let app = new Application(() => ({
		element: container!,
		appProps: { backgroundColor: '#000000', antialias: true }
	}));

	const appContext = getAppContext();

	let grid = $state<Grid>();

	let enablePan = $derived(appContext?.activeTool?.manifest.name === "pan");

</script>

<div class="canvas">
	<canvas bind:this={container}> </canvas>
</div>

{#if app.ready}
	<ViewPort bind:grid {enablePan}>
		{@render children()}
	</ViewPort>
{/if}

<style>
	.canvas {
		width: 100%;
		height: 100vh;
		padding-bottom: 5em;
		position: fixed;
		z-index: -1;
	}

	canvas {
		width: 100%;
		height: 100%;
		position: absolute;
	}
</style>
