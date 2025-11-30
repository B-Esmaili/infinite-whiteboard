<script lang="ts" module>
	export interface RectWidgetModel {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	}
</script>

<script lang="ts">
	import { Graphics } from 'pixi.js';
	import { getViewPortContext } from '../context.svelte.ts';
	import { drawRect } from '../toolbox-items/rect/handler.svelte.ts';

	const props: RectWidgetModel = $props();

	$inspect(props);

	const { x1, y1, x2, y2 } = props;

	const viewportContext = getViewPortContext();
	let graphics: Graphics;

	$effect(() => {

		if (viewportContext) {
			graphics = new Graphics();
			drawRect(graphics, x1, y1, x2, y2);
			viewportContext.viewort.addChild(graphics);
		}

		return () => {
			if (viewportContext){
				viewportContext.viewort.removeChild(graphics);
			}
		};
	});

</script>
