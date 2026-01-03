import { Bounds, FederatedPointerEvent, Graphics, Point, Rectangle, type Container, type FillInput, type StrokeInput } from "pixi.js";
import { extract, type MaybeGetter } from "runed";
import { drawRect } from "./drawing-helper";
import { getViewPortContext } from "../context.svelte";
import type { ViewportContext } from "../types";

export interface RectSelectionOptions {
    enabled: boolean;
    onSelectionStart?: (e: FederatedPointerEvent) => boolean | void;
    onSelectionDone?: (rect: Bounds) => void;
    onSelectionChange?: (rect: Bounds) => void;
    graphics?: boolean | {
        stroke?: StrokeInput;
        background?: FillInput;
    }
}

export class RectSelectionHelper {
    #startCoords = new Point(0, 0);
    #isDown = false;
    #selectionRect = new Graphics();
    #options: RectSelectionOptions;
    #container: Container | undefined;
    #viewportContext: ViewportContext;

    private getWorldPos(e: FederatedPointerEvent) {
        return e.data.getLocalPosition(this.#container!);
    }

    private worldPosFromEvent(e: FederatedPointerEvent) {
        return e.data.getLocalPosition(this.#container!);
    }

    private handlePointerDown(e: FederatedPointerEvent) {

        if (!this.#options.enabled) {
            return;
        }

        if (this.#options.onSelectionStart) {
            const result = this.#options.onSelectionStart(e);
            if (result === false) {
                return;
            }
        }

        this.#isDown = true;
        this.#container!.addChild(this.#selectionRect);

        const pos = this.getWorldPos(e);

        this.#startCoords.x = pos.x;
        this.#startCoords.y = pos.y;
        this.#selectionRect.clear();
    }

    private handlePointerUp(e: FederatedPointerEvent) {

        if (!this.#isDown) {
            return;
        }

        if (!this.#options.enabled) {
            return;
        }

        this.#isDown = false;

        if (this.#selectionRect && this.#container) {
            this.#container.removeChild(this.#selectionRect);
            const pos = this.getWorldPos(e);

            const minX = Math.min(this.#startCoords.x, pos.x);
            const minY = Math.min(this.#startCoords.y, pos.y);
            const maxX = Math.max(this.#startCoords.x, pos.x);
            const maxY = Math.max(this.#startCoords.y, pos.y);

            this.#options.onSelectionDone?.(new Bounds(minX, minY, maxX, maxY));
        }
    }

    private handlePointerMove(e: FederatedPointerEvent) {

        if (!this.#options?.enabled || !this.#isDown || !this.#startCoords) {
            return;
        }

        const gr = this.#options.graphics;

        if (this.#selectionRect && (gr === undefined || gr)) {
            this.#selectionRect.clear();

            const pos = this.getWorldPos(e);

            const minX = Math.min(this.#startCoords.x, pos.x);
            const minY = Math.min(this.#startCoords.y, pos.y);
            const maxX = Math.max(this.#startCoords.x, pos.x);
            const maxY = Math.max(this.#startCoords.y, pos.y);

            this.#options.onSelectionChange?.(new Bounds(minX, minY, maxX, maxY));

            drawRect(this.#selectionRect, minX, minY, maxX, maxY, (gr === undefined || gr === true) ? undefined : {
                fill: gr.background,
                stroke: gr.stroke
            });
        }
    }

    constructor(container: MaybeGetter<Container> | undefined, options: MaybeGetter<RectSelectionOptions>) {
        this.#options = $derived(extract(options));
        this.#container = $derived(extract(container));
        this.#viewportContext = getViewPortContext();
        const _this = this;

        $effect(() => {
            if (_this.#container) {
                _this.#container.on("pointerdown", _this.handlePointerDown.bind(_this));
                _this.#container.on("pointerup", _this.handlePointerUp.bind(_this));
                _this.#container.on("pointermove", _this.handlePointerMove.bind(_this));
            }

            return () => {
                if (_this.#container) {
                    _this.#container.off("pointerdown", _this.handlePointerDown);
                    _this.#container.off("pointerup", _this.handlePointerUp);
                    _this.#container.off("pointermove", _this.handlePointerMove);
                }
            }
        });
    }
}