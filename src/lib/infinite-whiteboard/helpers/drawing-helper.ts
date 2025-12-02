import type { FillInput, Graphics, StrokeInput } from "pixi.js";

export function drawRect(graphics: Graphics, x1: number, y1: number, x2: number, y2: number, options?: {
    stroke?: StrokeInput,
    fill?: FillInput
}) {
    const x = x1;
    const y = y1;
    const w = x2 - x1;
    const h = y2 - y1;

    const _fill = options?.fill ?? {
        alpha: 0
    };

    const _stroke = options?.stroke ?? { width: 1, color: 0xffffff };

    graphics
        .rect(x, y, w, h).setFillStyle(_fill).fill().setStrokeStyle(_stroke).stroke();
}