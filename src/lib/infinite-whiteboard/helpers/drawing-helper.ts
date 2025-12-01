import type { FillInput, Graphics, StrokeInput } from "pixi.js";

export function drawRect(graphics: Graphics, x1: number, y1: number, x2: number, y2: number, options?: {
    stroke?: StrokeInput,
    fill?: FillInput
}) {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);

    const _fill = options?.fill ?? {
        alpha: 0
    };

    const _stroke = options?.stroke ?? { width: 1, color: 0xffffff };

    graphics
        .roundRect(x, y, w, h, 5).setFillStyle(_fill).fill().setStrokeStyle(_stroke).stroke();
}