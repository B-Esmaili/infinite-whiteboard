import type { FederatedPointerEvent, Graphics } from "pixi.js";
import { Point } from "pixi.js";
import { extract, type MaybeGetter } from "runed";
import type { Viewport } from "pixi-viewport";

export interface DragDropHelperOptions {
    onStart: () => void;
    onEnd: (offset: Point) => void;
    onMove: (offset: Point) => void;
}

export class DragDropHelper {
    #graphics: Graphics | null;
    #isDown = false;
    #startPos: Point | null = null;
    #options: DragDropHelperOptions;
    #viewport: Viewport | null;
    constructor(graphics: MaybeGetter<Graphics | null>, viewport: MaybeGetter<Viewport | null>, options: MaybeGetter<DragDropHelperOptions>) {

        this.#graphics = $derived(extract(graphics));
        this.#options = $derived(extract(options));
        this.#viewport = $derived(extract(viewport));

        $effect(() => {
            if (this.#graphics && this.#viewport) {
                this.#graphics.on("pointerdown", this.handleDragStart.bind(this));
                this.#viewport.on("pointermove", this.handleDragMove.bind(this));
                this.#graphics.on("pointerup", this.handleDragEnd.bind(this));
                this.#viewport.on("pointerup", this.handleDragEnd.bind(this));

                return () => {
                    if (this.#graphics && this.#viewport) {
                        this.#graphics.off("pointerdown", this.handleDragStart);
                        this.#viewport.off("pointermove", this.handleDragMove);
                        this.#graphics.off("pointerup", this.handleDragEnd);
                        this.#viewport.off("pointerup", this.handleDragEnd);
                    }
                }
            }
        });
    }

    private handleDragStart(e: FederatedPointerEvent) {
        // if (!this.isGraphicsRegistered(e.target as Graphics)) {
        //     return;
        // }
        e.stopImmediatePropagation();
        e.stopPropagation();
        const worldCoords = this.#viewport?.toWorld(new Point(e.x, e.y))!;

        this.#isDown = true;
        this.#startPos = new Point(worldCoords.x, worldCoords.y);
        this.#options.onStart?.();
    }

    private handleDragMove(e: FederatedPointerEvent) {
        if (this.#isDown && this.#startPos) {

            const worldCoords = this.#viewport?.toWorld(new Point(e.x, e.y))!;

            const diffX = worldCoords.x - this.#startPos.x;
            const diffY = worldCoords.y - this.#startPos.y;
            const offset = new Point(diffX, diffY);
            this.#options.onMove?.(offset);
        }
    }

    private handleDragEnd(e: FederatedPointerEvent) {
        if (this.#startPos && this.#isDown) {
            this.#isDown = false;

            const worldCoords = this.#viewport?.toWorld(new Point(e.x, e.y))!;

            const diffX = worldCoords.x - this.#startPos.x;
            const diffY = worldCoords.y - this.#startPos.y;
            const offset = new Point(diffX, diffY);
            this.#options.onEnd?.(offset);
        }
        this.#startPos == null;
    }
}