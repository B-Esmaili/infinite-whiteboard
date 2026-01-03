import { getAppContext, getViewPortContext } from "@lib/infinite-whiteboard/context.svelte";
import { RectSelectionHelper } from "@lib/infinite-whiteboard/helpers/rect-selection-helper.svelte";
import type { WhiteboardElement } from "@lib/infinite-whiteboard/types";
import { Bounds, Graphics } from "pixi.js";

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