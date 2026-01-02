<script lang="ts" module>
	export interface RectViewModel {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	}
</script>

<script lang="ts">
	import { GraphicsContext, Point } from 'pixi.js';

	import { getAppContext, getViewPortContext } from '../context.svelte.ts';
	import { drawRect } from '../helpers/drawing-helper.ts';
	import type { WhiteboardElement } from '../types.ts';

	const el: WhiteboardElement<RectViewModel> = $props();

	const { register, unRegister } = el;

	const viewportContext = getViewPortContext();
	const appContext = getAppContext();

	let graphicsData = $derived.by(() => {
		const dt = new GraphicsContext();		
		drawRect(dt, el.viewModel.x1, el.viewModel.y1, el.viewModel.x2, el.viewModel.y2);
		return dt;
	});

	$effect(() => {
		if (viewportContext && appContext) {
			el.graphics.eventMode = 'static';

			if (el.graphics) {
				el.graphics.context = graphicsData;
			}

			register(el, {
				selectable: true,
				draggable: {
					adapter: (element: WhiteboardElement<RectViewModel>, offset: Point) => {
						element.viewModel.x1 += offset.x;
						element.viewModel.y1 += offset.y;
						element.viewModel.x2 += offset.x;
						element.viewModel.y2 += offset.y;
						return element.viewModel;
					}
				}
			});
		}

		return () => {
			if (el) {
				unRegister(el);
			}
		};
	});
</script>
