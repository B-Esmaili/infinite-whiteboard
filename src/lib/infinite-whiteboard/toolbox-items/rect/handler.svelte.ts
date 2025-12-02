import { getAppContext, getViewPortContext } from "@lib/infinite-whiteboard/context.svelte"
import { Bounds, Rectangle } from "pixi.js";
import RectWidget from "@lib/infinite-whiteboard/widgets/rect-widget.svelte";
import RectEditor from "@lib/infinite-whiteboard/editors/rect-editor.svelte";
import { RectSelectionHelper } from "@lib/infinite-whiteboard/helpers/rect-selection-helper.svelte";

export function handle() {
    let appContext = getAppContext();
    let tool = $derived(appContext?.activeTool);

    let viewport = $derived.by(() => getViewPortContext()?.viewport);
    let isEnabled = $derived(tool?.manifest.name === "rect");

    new RectSelectionHelper(() => viewport, () => ({
        enabled: isEnabled,
        onSelectionDone: (bounds: Bounds) => {
            if (appContext) {
                appContext.addElement({
                    viewModel: {
                        x1: bounds.x,
                        y1: bounds.y,
                        x2: bounds.x + bounds.width,
                        y2: bounds.y + bounds.height
                    },
                    name: "rect",
                    editor: RectEditor,
                    view: RectWidget
                });
            }
        }
    }));
}