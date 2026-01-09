<script lang="ts" module>
	import { getViewPortContext } from '@lib/infinite-whiteboard/context.svelte';
	import type { ElementRegisterOptions, WhiteboardElement } from '@lib/infinite-whiteboard/types';
	import type { Viewport } from 'pixi-viewport';
	import { Container, Graphics } from 'pixi.js';
	import { watch } from 'runed';
	import type { Component } from 'svelte';

	export interface ElementHostProps {
		componentType: Component<any>;
		componentProps: WhiteboardElement;
	}
</script>

<script lang="ts">
	let props: ElementHostProps = $props();

	let compProps = $derived(props.componentProps);

	let viewPortContext = getViewPortContext();

	let id = 0;
	let parents = $derived(compProps.rotations && ++id);

	function resetTransform(gr: Container) {
		gr.position.set(0, 0);
		gr.rotation = 0;
		gr.pivot.set(0, 0);
	}

	//const parentMap = new Map<number,>();
	let parent = $derived.by(() => {
		if (compProps.rotations.length) {
			let current: Container | Viewport | null = compProps.graphics;
			let foundRotationParents = [];

			// while (current !== viewPortContext.viewport) {
			// 	if (current === null) {
			// 		break;
			// 	}
			// 	if (current.label.startsWith('rotate')) {
			// 		foundRotationParents.push([current.rotation, current.pivot]);
			// 	}
			// 	current = current.parent;
			// }

			let innermostParent;
			const outerParent = compProps.rotations.reduce(
				(p: Container | Graphics, c, i) => {
					let existingParent;
					existingParent = p.parent;

					if (existingParent?.label?.startsWith('rotation')) {
						existingParent.rotation = c.rotation;
						existingParent.pivot.set(c.pivot.x, c.pivot.y);
						existingParent.position.set(c.pivot.x, c.pivot.y);
						return existingParent;
					}

					const container = new Container({
						isRenderGroup: true
					});

					container.label = 'rotation-new';
					container.position.set(c.pivot.x, c.pivot.y);
					container.pivot.set(c.pivot.x, c.pivot.y);
					container.rotation = c.rotation;

					if (i === 0) {
						innermostParent = container;
					}

					if (p.label === 'rotation-new') {
						container.reparentChild(p);
						p.label = 'rotation';
					}

					return container;
				},
				compProps.graphics as Container | Graphics
			);

			if (!outerParent.parent) {
				viewPortContext.viewport.addChild(outerParent);
			} else {
				if (outerParent.parent !== viewPortContext.viewport) {
					viewPortContext.viewport.reparentChild(outerParent);
				}
			}

			return innermostParent;
		}

		return viewPortContext.viewport;
	});

	watch(
		() => parent,
		(_parent) => {
			if (viewPortContext && parent) {
				if (compProps.graphics.parent !== parent) {
					parent.reparentChild(compProps.graphics);
					resetTransform(compProps.graphics);
				}
			}
		}
	);

	$effect(() => {
		return () => {
			if (viewPortContext && parent) {
				parent.removeChild(compProps.graphics);
			}
		};
	});

	// let wraps = $derived.by(() => {

	// 	if (compProps.rotations.length) {
	// 		return [];
	// 	}

	// 	return compProps.rotations.reduce((p, c) => {}, null);
	// });
</script>

<props.componentType props={compProps}></props.componentType>
