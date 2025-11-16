<script lang="ts">
	import { Application } from './Application.svelte.ts';
	import Grid from './elements/grid.svelte';
	import ViewPort from './elements/view-port.svelte';
	const { children } = $props();

	let container: HTMLCanvasElement | null = null;

	let app = new Application(() => ({
		element: container!,
		appProps: { backgroundColor: '#000000', resizeTo: container!, antialias: true }
	}));
</script>

<canvas bind:this={container}></canvas>

{#if app.ready}
	<ViewPort>
		<Grid>
			{@render children()}
		</Grid>
	</ViewPort>
{/if}

<style>
	canvas {
		width: 100%;
		height: 100vh;
	}
</style>
