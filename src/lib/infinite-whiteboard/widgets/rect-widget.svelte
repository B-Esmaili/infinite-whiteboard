<script lang="ts" module>
	export interface RectViewModel {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	}
</script>

<script lang="ts">
	import { Bounds, GraphicsContext, Point } from 'pixi.js';

	import { getAppContext, getViewPortContext } from '../context.svelte.ts';
	import { drawRect } from '../helpers/drawing-helper.ts';
	import type { WhiteboardElement } from '../types.ts';

	const el: WhiteboardElement<RectViewModel> = $props();

	const { register, unRegister } = el;

	const viewportContext = getViewPortContext();
	const appContext = getAppContext();

	let lastScaleCoords: Bounds | null = null;

	function getContextFromCoords(
		minX: number,
		minY: number,
		maxX: number,
		maxY: number
	): GraphicsContext {
		const dt = new GraphicsContext();
		drawRect(dt, minX, minY, maxX, maxY);
		return dt;
	}

	let graphicsData = $derived.by(() => {
		return getContextFromCoords(el.viewModel.x1, el.viewModel.y1, el.viewModel.x2, el.viewModel.y2);
	});

	$effect(() => {
		if (viewportContext && appContext) {
			el.graphics.eventMode = 'static';
			el.graphics.label = 'rect';

			if (el.graphics) {
				el.graphics.context = graphicsData;
			}

			register(el, {
				selectable: true,
				draggable: {
					moveAdapter: (element: WhiteboardElement<RectViewModel>, offset: Point) => {
						element.viewModel.x1 += offset.x;
						element.viewModel.y1 += offset.y;
						element.viewModel.x2 += offset.x;
						element.viewModel.y2 += offset.y;
						return element.viewModel;
					}
				},
				scalable: {
					onStart: () => {
						lastScaleCoords = new Bounds(
							el.viewModel.x1,
							el.viewModel.y1,
							el.viewModel.x2,
							el.viewModel.y2
						);
					},
					scaleAdapter: (
						element: WhiteboardElement<RectViewModel>,
						applyScale,
						finalize: boolean
					) => {
						if (lastScaleCoords) {
							const newBounds = applyScale(lastScaleCoords);
							if (finalize) {
								element.viewModel.x1 = newBounds.minX;
								element.viewModel.y1 = newBounds.minY;
								element.viewModel.x2 = newBounds.maxX;
								element.viewModel.y2 = newBounds.maxY;
								return element.viewModel;
							}

							return getContextFromCoords(
								newBounds.minX,
								newBounds.minY,
								newBounds.maxX,
								newBounds.maxY
							);
						}
						return element.viewModel;
					},
					onEnd: () => {
						lastScaleCoords = null;
					}
				},
				rotatable: {
					roateAdapter(element: WhiteboardElement<RectViewModel>, degree: number) {
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
