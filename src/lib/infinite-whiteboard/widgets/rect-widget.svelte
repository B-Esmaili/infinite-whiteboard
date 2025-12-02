<script lang="ts" module>
	export interface RectViewModel {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	}
</script>

<script lang="ts">
	import { getAppContext, getViewPortContext } from '../context.svelte.ts';
	import { drawRect } from '../helpers/drawing-helper.ts';
	import type { WhiteboardElement } from '../types.ts';

	const el: WhiteboardElement<RectViewModel> = $props();

	const {
		viewModel: { x1, y1, x2, y2 },
		register,
		unRegister
	} = el;

	const viewportContext = getViewPortContext();
	const appContext = getAppContext();

	$effect(() => {
		if (viewportContext && appContext) {
			drawRect(el.graphics, x1, y1, x2, y2);

			register(el, {
				selectable: true
			});
		}

		return () => {
			if (el) {
				unRegister(el);
			}
		};
	});
</script>
