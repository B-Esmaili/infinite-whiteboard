<script lang="ts">
	import { Application } from './Application.svelte.ts';
	const { children } = $props();

	let container: HTMLCanvasElement | null = null;

	let app = new Application(() => ({
		element: container!,
		appProps: { backgroundColor: '#000000', resizeTo: container!, antialias: true }
	}));
</script>

<canvas bind:this={container}></canvas>

{#if app.ready}
	{@render children()}
{/if}

<style>
	canvas {
		width: 100%;
	}
</style>