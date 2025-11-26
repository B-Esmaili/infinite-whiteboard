import { getAppContext, getViewPortContext } from "@lib/infinite-whiteboard/context.svelte"
import { Graphics, Point, Rectangle } from "pixi.js";

export function handle() {
    let appContext = getAppContext();
    let tool = $derived(appContext?.activeTool);
    let startCoords = new Point(0, 0);
    let isDown = false;
    let newRect: Graphics | null;

    let viewport = $derived.by(() => getViewPortContext()?.viewort);

    function getWorldPos(e) {
        // Option A: preferred and simple
        return e.data.getLocalPosition(viewport);
        // Option B: equivalent
        // return viewport.toWorld(e.data.global);
    }

    function drawRect(x1: number, y1: number, x2: number, y2: number) {
        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);

        if (newRect) {
            newRect.clear();
            newRect.rect(x, y, w, h).stroke({ width: 2, color: 0xff0000, alpha: 1, pixelLine: false });
        }
    }

    function worldPosFromEvent(e) {
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

            viewport.on("pointerup", () => {
                if (tool?.manifest.name === "rect") {
                    isDown = false;
                    if (newRect) {
                        const newRect2 = newRect.clone(true);
                        viewport.addChild(newRect2);
                        viewport.removeChild(newRect);
                    }
                }
            });


            viewport.on("pointermove", (e) => {
                if (tool?.manifest.name === "rect") {
                    if (!isDown || !startCoords) {
                        return;
                    }
                    const p = worldPosFromEvent(e);

                    drawRect(startCoords.x, startCoords.y, p.x, p.y);

                    // if (newRect) {
                    //     newRect.rect(, startCoords.y, e.)
                    //         .fill(0xff0000)
                    //         .circle(200, 200, 50)
                    //         .stroke(0x00ff00)
                    //         .lineStyle(5)
                    //         .moveTo(300, 300)
                    //         .lineTo(400, 400);
                    // }
                }
            });

        }
    })
}