import { getAppContext, getViewPortContext } from "@lib/infinite-whiteboard/context.svelte";
import { drawRect } from "@lib/infinite-whiteboard/helpers/drawing-helper";
import { RectSelectionHelper } from "@lib/infinite-whiteboard/helpers/rect-selection-helper.svelte";
import type { WhiteboardElement } from "@lib/infinite-whiteboard/types";
import { Bounds, Graphics, type Rectangle } from "pixi.js";

export function handle() {
    let appContext = getAppContext();
    let tool = $derived(appContext?.activeTool);

    let viewport = $derived.by(() => getViewPortContext()?.viewport);
    let isEnabled = $derived(tool?.manifest.name === "selection");

    let indicators = new Map<WhiteboardElement, Graphics>();

    function updateSelection(bounds: Bounds) {
        const selectedItems = appContext?.getElementsInRange(bounds);

        if (selectedItems) {
            indicators.entries().forEach((item) => {
                if (selectedItems.findIndex(e => e === item[0]) < 0) {
                    viewport.removeChild(item[1]);
                    indicators.delete(item[0]);
                }
            });

            // selectedItems.forEach(element => {
            //     let indg = indicators.get(element);
            //     const isNew = indg === undefined;

            //     const bounds = element.graphics.getBounds();

            //     const p1 = viewport.toWorld(bounds.minX - 5, bounds.minY - 5);
            //     const p2 = viewport.toWorld(bounds.maxX + 5, bounds.maxY + 5);

            //     if (!indg) {
            //         indg = new Graphics();
            //         viewport.addChild(indg);
            //     }
            //     if (isNew) {
            //         indicators.set(element, indg);
            //     }

            //     indg.clear();
            //     indg.zIndex = -1;
            //     drawRect(indg, p1.x - 5, p1.y - 5, p2.x + 5, p2.y + 5);
            // });

            appContext?.setSelectedElements(selectedItems);
        }
    }

    new RectSelectionHelper(() => viewport, () => ({
        enabled: isEnabled,
        graphics: {
            background: {
                color: 0x33333,
                alpha: 0.3
            },
            stroke: {
                color: 0xb4b0ff,
                width: 1
            }
        },
        onSelectionDone: (bounds: Bounds) => {
            updateSelection(bounds);
        },
        onSelectionChange: (bounds: Bounds) => {
            updateSelection(bounds);
        }
    }))
}