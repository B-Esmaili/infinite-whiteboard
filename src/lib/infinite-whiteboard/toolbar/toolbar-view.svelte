<script lang="ts">
	import { ChevronRight, ChevronUpCircleIcon, ChevronUpIcon } from '@lucide/svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { getToolbarContext } from '../context.svelte';
	import * as DropdownMenu from '@lib/components/ui/dropdown-menu';
	import Button from '@lib/components/ui/button/button.svelte';
	import type { ToolbarItem } from './toolbar.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let toolbarContext = getToolbarContext();
	let activeItem = $derived(toolbarContext?.activeItem?.name ?? 'selection');
	let items = $derived(toolbarContext?.items);
	let flatItems = $derived(getFlatItems(items));

	function getFlatItems(_items: ToolbarItem[]): ToolbarItem[] {
		const subs = _items.flatMap((e) => e.items ?? []);
		return subs.length ? [..._items, ...getFlatItems(subs)] : _items;
	}

	function stopPropagation(node: HTMLElement) {
		node.addEventListener(
			'click',
			(e) => {
				e.stopPropagation();
			},
			true
		);
	}

	const handleSubItemChange = (parentName: string) => (v: string) => {
		const allParents = `${parentName}:${v}`.split(':');
		let parents = [];

		containerState.keys().forEach((item) => {
			containerState.set(item, '');
		});

		for (let i = 0; i < allParents.length - 1; i++) {
			const p = allParents[i];
			const currentParent = [...parents, p].join(':');
			containerState.set(currentParent, allParents[i + 1]);
			parents.push(p);
		}

		if (toolbarContext) {
			const sel = flatItems.find((i) => i.name === v);
			toolbarContext.setActiveItem(sel!);
		}
	};

	let containerState = new SvelteMap<string, string>();
	containerState.set('', 'selection');
</script>

{#snippet subItem(parentName: string, item: ToolbarItem)}
	{@const fullName = `${parentName}:${item.name}`}
	{#if !item.items?.length}
		<DropdownMenu.RadioItem value={item.name}>
			<item.icon />
			{item.displayName}
		</DropdownMenu.RadioItem>
	{:else}
		<DropdownMenu.RadioItem value={item.name}>
			<span class="flex w-full items-center justify-between">
				<span class="flex items-center gap-2">
					<item.icon />
					{item.displayName}
				</span>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="flex flex-row">
						{#snippet child({ props })}
							<button class="absolute right-0 z-10 px-1" use:stopPropagation {...props}>
								<ChevronRight />
							</button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-52">
						{@render subList(fullName, item.items)}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</span>
		</DropdownMenu.RadioItem>
	{/if}
{/snippet}

{#snippet subList(parentName: string, subItems: ToolbarItem[])}
	<DropdownMenu.RadioGroup
		value={containerState.has(parentName) ? containerState.get(parentName) : ''}
		onValueChange={handleSubItemChange(parentName)}
	>
		{#each subItems as item}
			{@render subItem(parentName, item)}
		{/each}
	</DropdownMenu.RadioGroup>
	<!-- <DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.Item class="text-destructive focus:text-destructive">
							<Trash2 />
							Trash
						</DropdownMenu.Item>
					</DropdownMenu.Group> -->
{/snippet}

<div class="bg-card p-2">
	<ToggleGroup.Root
		type="single"
		value={containerState.get('')}
		onValueChange={handleSubItemChange('')}
	>
		{#each items as item}
			{#if !item.items?.length}
				<ToggleGroup.Item value={item.name} aria-label={item.displayName}>
					<item.icon class="size-4" />
				</ToggleGroup.Item>
			{:else}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<ToggleGroup.Item aria-label="More Options" class="relative" value={item.name}>
								<item.icon class="size-4" />
								<Button
									{...props}
									class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1!"
									variant="ghost"
								>
									<ChevronUpIcon class="size-4" />
								</Button>
							</ToggleGroup.Item>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-64">
						{@render subList(`:${item.name}`, item.items)}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		{/each}
	</ToggleGroup.Root>
</div>

<style lang="scss">
	div {
		position: fixed;
		left: 50%;
		bottom: 1em;
		transform: translateX(-50%);
		border-radius: 1em;
	}
</style>
