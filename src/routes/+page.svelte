<script lang="ts">
	import { browser } from '$app/environment';
	import Rect from '$lib/infinite-whiteboard/elements/rect.svelte';
	import '../app.css';

	let InfiniteWhiteboard = $state<any>(null);

	$effect(() => {
		(async function () {
			if (browser) {
				InfiniteWhiteboard = (await import('$lib/infinite-whiteboard/infinite-whiteboard.svelte'))
					.default;
			}
		})();
	});
</script>

{#if InfiniteWhiteboard}
	<InfiniteWhiteboard></InfiniteWhiteboard>
{/if}

<style>
	:global(body) {
		padding: 0;
		margin: 0;
	}
</style>
