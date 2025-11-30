import { getAppContext, getViewPortContext } from "@lib/infinite-whiteboard/context.svelte"
import { Graphics, Point, Rectangle } from "pixi.js";
import RectWidget from "@lib/infinite-whiteboard/widgets/rect-widget.svelte";
import RectEditor from "@lib/infinite-whiteboard/editors/rect-editor.svelte";


export function drawRect(graphics: Graphics, x1: number, y1: number, x2: number, y2: number) {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);

    graphics
        .roundRect(x, y, w, h, 5).setFillStyle({
            color: 0x025469,
            alpha: 0.6
        }).fill().setStrokeStyle({ width: 2, color: 0xff0000, alpha: 1, pixelLine: false }).stroke();
}

export function handle() {
    let appContext = getAppContext();
    let tool = $derived(appContext?.activeTool);
    let startCoords = new Point(0, 0);
    let isDown = false;
    let newRect: Graphics | null;

    let viewport = $derived.by(() => getViewPortContext()?.viewort);
    let x1: number, y1: number;

    function getWorldPos(e: any) {
        return e.data.getLocalPosition(viewport);
    }

    function worldPosFromEvent(e: any) {
        return e.data.getLocalPosition(viewport);
    }

    $effect(() => {
        if (viewport) {
            viewport.on("pointerdown", (e) => {
                if (tool?.manifest.name === "rect") {
                    isDown = true;
                    newRect = new Graphics();
                    viewport.addChild(newRect);

                    const pos = getWorldPos(e);

                    startCoords.x = pos.x;
                    startCoords.y = pos.y;
                    newRect.clear();
                }
            });

            viewport.on("pointerup", (e) => {
                if (tool?.manifest.name === "rect") {
                    isDown = false;
                    if (newRect) {
                        viewport.removeChild(newRect);
                        const pos = getWorldPos(e);
                        if (appContext) {
                            appContext.addWidget({
                                widgetModel: {
                                    x1: startCoords.x,
                                    y1: startCoords.y,
                                    x2: pos.x,
                                    y2: pos.y
                                },
                                mounted: false,
                                name: "rect",
                                editor: RectEditor,
                                widget: RectWidget
                            });
                        }
                    }
                }
            });


            viewport.on("pointermove", (e) => {
                if (tool?.manifest.name === "rect") {
                    
                    if (!isDown || !startCoords) {
                        return;
                    }

                    const p = worldPosFromEvent(e);

                    if (newRect) {
                        newRect.clear();
                        drawRect(newRect, startCoords.x, startCoords.y, p.x, p.y);
                    }
                }
            });

        }
    })
}