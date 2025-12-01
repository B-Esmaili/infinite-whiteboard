import { getAppContext, getViewPortContext } from "@lib/infinite-whiteboard/context.svelte";
import { RectSelectionHelper } from "@lib/infinite-whiteboard/helpers/rect-selection-helper.svelte";
import type { Rectangle } from "pixi.js";

export function handle() {
    let appContext = getAppContext();
    let tool = $derived(appContext?.activeTool);

    let viewport = $derived.by(() => getViewPortContext()?.viewort);
    let isEnabled = $derived(tool?.manifest.name === "selection");

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
        onSelectionDone: (rect: Rectangle) => {

        }
    }));
}