<script lang="ts">
	import { Graphics } from 'pixi.js';
	import { getContainerContext } from '../context.svelte.ts';

	$effect(() => {
		debugger
		let context = getContainerContext();
		const g = new Graphics();

		g.stroke(0xff0000);
		g.setStrokeStyle({
			width: 5
		});
		g.fill({
			color: 0xf59854,
			alpha: 0.5
		});
		g.roundRect(100, 100, 200, 200);
		g.fill();
		g.stroke();
		if (context && context.container) {
			context.container.addChild(g);
		}

		return () => {
			context?.container?.removeChild?.(g);
		};
	});
</script>
