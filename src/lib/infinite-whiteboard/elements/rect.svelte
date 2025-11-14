<script lang="ts">
	import { Graphics } from 'pixi.js';
	import { getAppContext } from '../context.svelte.ts';

	$effect(() => {
		let context = getAppContext();
		const g = new Graphics();

		g.stroke(0xff0000);
        g.setStrokeStyle({
            width:5
        })
		g.fill({
			color : 0xF59854,
			alpha : 0.5
		});
		g.roundRect(100, 100, 200, 200);
		g.fill();
		g.stroke();
		if (context && context.app) {
			context.app.stage.addChild(g);
		}

		return () => {
			context?.app?.stage.removeChild(g);
		};
	});

</script>