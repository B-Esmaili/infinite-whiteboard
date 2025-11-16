<script lang="ts">
	import { Container, Graphics, Point } from 'pixi.js';
	import { getAppContext, getContainerContext, getViewPortContext } from '../context.svelte.ts';
	//import { toSc } from 'pixi-viewport';
	import type { MovedEvent } from 'pixi-viewport/dist/types';
	import { Debounced, Throttled, watch } from 'runed';

	const { children } = $props();

	let worldPoseInstant = $state({ x: 0, y: 0 });
	let scaleInstant = $state({ x: 1, y: 1 });
	const worldPos = new Throttled(() => worldPoseInstant, 500);
	const scale = new Throttled(() => scaleInstant, 500);

	let GRID_SIZE = 50;

	const grids = new Map<string, Graphics>();

	const layer = new Container();

	function redrawGrid() {
		let viewportContext = getViewPortContext();
		let containerContext = getContainerContext();
		let appContext = getAppContext();

		//console.log(viewportContext.viewort.toWorld(new Point(0, 0)));
		//return;

		if (!viewportContext || !containerContext || !appContext) {
			return;
		}

		const scaleX = scale.current.x || 1;
		const scaleY = scale.current.y || 1;

		const worldLeftTop = viewportContext.viewort.toWorld(new Point(0, 0));
		const worldLeftBottom = viewportContext.viewort.toWorld(
			new Point(0, viewportContext.viewort.screenHeight)
		);
		const worldRightTop = viewportContext.viewort.toWorld(
			new Point(viewportContext.viewort.screenWidth, 0)
		);
		const worldRightBottom = viewportContext.viewort.toWorld(
			new Point(0, viewportContext.viewort.screenHeight)
		);

		const gridRemSpaceX = worldLeftTop.x % GRID_SIZE;
		const gridRemSpaceY = worldLeftTop.y % GRID_SIZE;

		const startX = worldLeftTop.x - gridRemSpaceX;
		const endX = worldRightTop.x;
		const startY = worldLeftTop.y - gridRemSpaceY;
		const endY = worldRightBottom.y;

		let lastX = 0;

		for (let i = startX; i < endX; i += GRID_SIZE) {
			lastX = i;
			const key = `V-${i}`;

			const existingLine = grids.get(key);

			const x1 = i,
				y1 = worldLeftTop.y,
				x2 = i,
				y2 = worldLeftBottom.y;

			if (existingLine) {
				existingLine.clear();
			}

			const Line = existingLine ?? new Graphics();

			Line.stroke({
				color: '#111',
				width: 1
			});

			Line.moveTo(x1, y1);
			Line.lineTo(x2, y2);

			Line.stroke();

			if (!existingLine) {
				grids.set(key, Line);
				layer.addChild(Line);
			}
		}

		//Cleanup out of viewport vertical lines

		let curX = lastX;

		while (true) {
			curX += GRID_SIZE;
			const key = `V-${curX}`;
			const exists = grids.has(key);
			if (!exists) {
				break;
			} else {
				layer.removeChild(grids.get(key)!);
				grids.delete(key);
			}
		}

		curX = startX;

		while (true) {
			curX -= GRID_SIZE;
			const key = `V-${curX}`;
			const exists = grids.has(key);
			if (!exists) {
				break;
			} else {
				layer.removeChild(grids.get(key)!);
				grids.delete(key);
			}
		}

		let lastY = 0;

		for (let i = startY; i < endY; i += GRID_SIZE) {
			lastY = i;
			const key = `H-${i}`;

			const existingLine = grids.get(key);

			const x1 = worldLeftTop.x,
				y1 = i,
				x2 = worldRightTop.x,
				y2 = i;

			if (existingLine) {
				existingLine.clear();
			}

			const Line = existingLine ?? new Graphics();

			Line.stroke({
				color: '#111',
				width: 1
			});

			Line.moveTo(x1, y1);
			Line.lineTo(x2, y2);

			Line.stroke();

			if (!existingLine) {
				grids.set(key, Line);
				layer.addChild(Line);
			}
		}

		//Cleanup out of viewport horizontal lines

		let curY = lastY;

		while (true) {
			curY += GRID_SIZE;
			const key = `H-${curY}`;
			const exists = grids.has(key);
			if (!exists) {
				break;
			} else {
				layer.removeChild(grids.get(key)!);
				grids.delete(key);
			}
		}

		curY = startY;

		while (true) {
			curY -= GRID_SIZE;
			const key = `H-${curY}`;
			const exists = grids.has(key);
			if (!exists) {
				break;
			} else {
				layer.removeChild(grids.get(key)!);
				grids.delete(key);
			}
		}
	}

	watch(() => worldPos.current, redrawGrid);
	watch(() => scale.current, redrawGrid);

	let viewportContext = getViewPortContext();

	$effect(() => {
		function moveHandler(vp: MovedEvent) {
			//console.log(`${vp.viewport.left}:${vp.viewport.top}`);
			worldPoseInstant = {
				x: vp.viewport.x,
				y: vp.viewport.y
			};
		}

		if (viewportContext) {
			viewportContext.viewort.addChildAt(layer, 0);

			viewportContext.viewort.on('move', () => console.log('move'));
			viewportContext.viewort.on('moved', moveHandler);
			viewportContext.viewort.on('zoomed', (e) => {
				scaleInstant = {
					x: e.viewport.scale.x,
					y: e.viewport.scale.y
				};
			});
		}

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

		// if (context && context.app) {
		// 	context.app.stage.addChild(g);
		// }

		return () => {
			if (viewportContext) {
				viewportContext.viewort.removeChild(layer);
				viewportContext.viewort.off('moved', moveHandler);
			}
			//context?.app?.stage.removeChild(g);
		};
	});
</script>

{#if children}
	{@render children()}
{/if}
