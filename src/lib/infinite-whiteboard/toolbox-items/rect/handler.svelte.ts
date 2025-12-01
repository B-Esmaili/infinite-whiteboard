import { getAppContext, getViewPortContext } from "@lib/infinite-whiteboard/context.svelte"
import { Rectangle } from "pixi.js";
import RectWidget from "@lib/infinite-whiteboard/widgets/rect-widget.svelte";
import RectEditor from "@lib/infinite-whiteboard/editors/rect-editor.svelte";
import { RectSelectionHelper } from "@lib/infinite-whiteboard/helpers/rect-selection-helper.svelte";

export function handle() {
    let appContext = getAppContext();
    let tool = $derived(appContext?.activeTool);

    let viewport = $derived.by(() => getViewPortContext()?.viewort);
    let isEnabled = $derived(tool?.manifest.name === "rect");

    new RectSelectionHelper(() => viewport, () => ({
        enabled: isEnabled,
        onSelectionDone: (rect: Rectangle) => {
            if (appContext) {
                appContext.addWidget({
                    widgetModel: {
                        x1: rect.x,
                        y1: rect.y,
                        x2: rect.x + rect.width,
                        y2: rect.y + rect.height
                    },
                    mounted: false,
                    name: "rect",
                    editor: RectEditor,
                    widget: RectWidget
                });
            }
        }
    }));
}