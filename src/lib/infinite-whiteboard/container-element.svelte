<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ContainerContext } from './types.ts';
	import { setContainerContext } from './context.svelte.ts';

	export interface ContainerElementProps {
		context: ContainerContext;
		children?: Snippet;
	}
</script>

<script lang="ts">
	let { context, children }: ContainerElementProps = $props();

	setContainerContext(context);
</script>
{#if context.container && children}
{$inspect(children)}
	{@render children()}
{/if}
