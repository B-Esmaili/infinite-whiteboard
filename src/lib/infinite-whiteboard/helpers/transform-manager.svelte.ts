import { extract, watch, type MaybeGetter } from "runed";
import type { ElementRegisterOptions, TransformOptions, WhiteboardElement } from "../types";
import { Bounds, Container, Graphics, Point } from "pixi.js";
import type { Selection } from "../selection.svelte";
import { drawRect } from "./drawing-helper";
import type { Viewport } from "pixi-viewport";
import { DragDropHelper } from "./drag-drop-helper.svelte";
import { tick } from "svelte";


export interface DragDropOptions {
    onMoveProgress: (offset: Point, elements: TransformElement[]) => void;
    onScaleProgress: (applyScale: (bounds: Bounds) => Bounds, elements: TransformElement[], done: boolean) => void;
}

export interface TransformElement {
    element: WhiteboardElement;
    draggable?: false | Omit<TransformOptions<any>, 'roateAdapter' | 'scaleAdapter'>;
    scalable?: false | Omit<TransformOptions<any>, 'roateAdapter' | 'moveAdapter'>;
    rotatable?: false | Omit<TransformOptions<any>, 'moveAdapter' | 'scaleAdapter'>;
}

export class TransformManager {
    #options: DragDropOptions;
    #container: Container;
    #viewport: Viewport;
    #elements: TransformElement[] = [];
    #selection: Selection;
    #transformContainer = $state<Container | null>(null);
    #transformGraphics = $state<Graphics | null>(null);
    #transformControlContainer = $state<Container | null>(null);
    #transformItemsWrap = $state<Container | null>(null);
    #leftTopScaleGraphics = $state<Graphics | null>(null);
    #rightTopScaleGraphics = $state<Graphics | null>(null);
    #leftBottomScaleGraphics = $state<Graphics | null>(null);
    #rightBottomScaleGraphics = $state<Graphics | null>(null);
    #rotateGraphics = $state<Graphics | null>(null);
    #cumulativeOffset = new Point(0, 0);
    #initialBounds = $state(new Bounds());
    #currentBounds = $state<Bounds | null>(null);
    #currentSelection: WhiteboardElement[];

    constructor(container: MaybeGetter<Container>, viewport: MaybeGetter<Viewport>, selection: MaybeGetter<Selection>, options: MaybeGetter<DragDropOptions>) {
        this.#options = $derived(extract(options));
        this.#container = $derived(extract(container));
        this.#selection = $derived(extract(selection));
        this.#viewport = $derived(extract(viewport));

        new DragDropHelper(() => this.#transformGraphics, () => this.#viewport, () => ({
            onStart: this.handleStartMove.bind(this),
            onMove: this.handleMove.bind(this),
            onEnd: this.handleEndMove.bind(this),
        }));

        new DragDropHelper(() => this.#leftTopScaleGraphics, () => this.#viewport, () => ({
            onStart: this.handleStartLeftTopResize.bind(this),
            onMove: this.handleMoveLeftTopResize.bind(this),
            onEnd: this.handleEndLeftTopResize.bind(this),
        }));

        new DragDropHelper(() => this.#rightBottomScaleGraphics, () => this.#viewport, () => ({
            onStart: this.handleStartRightBottomResize.bind(this),
            onMove: this.handleMoveRightBottomResize.bind(this),
            onEnd: this.handleEndRightBottomResize.bind(this),
        }));

        new DragDropHelper(() => this.#leftBottomScaleGraphics, () => this.#viewport, () => ({
            onStart: this.handleStartLeftBottomResize.bind(this),
            onMove: this.handleMoveLeftBottomResize.bind(this),
            onEnd: this.handleEndLeftBottomResize.bind(this),
        }));

        new DragDropHelper(() => this.#rightTopScaleGraphics, () => this.#viewport, () => ({
            onStart: this.handleStartRightTopResize.bind(this),
            onMove: this.handleMoveRightTopResize.bind(this),
            onEnd: this.handleEndRightTopResize.bind(this),
        }));

        this.#currentSelection = $derived(this.#selection?.currentSelection ?? []);

        watch(() => this.#selection?.currentSelection ?? [], this.handleSelectionChange.bind(this));
        //watch(() => this.#leftTopGraphicsOffset, this.updateTransformGraphics.bind(this));
    }

    private handleScale(offset: Point, rel: string , done : boolean) {

        let newMinX = 0;
        let newMinY = 0;
        let newMaxX = 0;
        let newMaxY = 0;

        if (rel === "lt") {
            newMinX = Math.min(this.#initialBounds.minX + offset.x, this.#initialBounds.maxX);
            newMinY = Math.min(this.#initialBounds.minY + offset.y, this.#initialBounds.maxY);
            newMaxX = Math.max(this.#initialBounds.minX + offset.x, this.#initialBounds.maxX);
            newMaxY = Math.max(this.#initialBounds.minY + offset.y, this.#initialBounds.maxY);
        } else if (rel === "rb") {
            newMinX = Math.min(this.#initialBounds.minX, this.#initialBounds.maxX + offset.x);
            newMinY = Math.min(this.#initialBounds.minY, this.#initialBounds.maxY + offset.y);
            newMaxX = Math.max(this.#initialBounds.minX, this.#initialBounds.maxX + offset.x);
            newMaxY = Math.max(this.#initialBounds.minY, this.#initialBounds.maxY + offset.y);
        } else if (rel === "lb") {
            newMinX = Math.min(this.#initialBounds.minX + offset.x, this.#initialBounds.maxX);
            newMinY = Math.min(this.#initialBounds.minY, this.#initialBounds.maxY + offset.y);
            newMaxX = Math.max(this.#initialBounds.minX + offset.x, this.#initialBounds.maxX);
            newMaxY = Math.max(this.#initialBounds.minY, this.#initialBounds.maxY + offset.y);
        } else {
            newMinX = Math.min(this.#initialBounds.minX, this.#initialBounds.maxX + offset.x);
            newMinY = Math.min(this.#initialBounds.minY + offset.y, this.#initialBounds.maxY);
            newMaxX = Math.max(this.#initialBounds.minX, this.#initialBounds.maxX + offset.x);
            newMaxY = Math.max(this.#initialBounds.minY + offset.y, this.#initialBounds.maxY);
        }

        const oldW = this.#initialBounds.maxX - this.#initialBounds.minX;
        const oldH = this.#initialBounds.maxY - this.#initialBounds.minY;

        const newW = newMaxX - newMinX;
        const newH = newMaxY - newMinY;

        const scaleX = newW / oldW;
        const scaleY = newH / oldH;

        const selectedItems = this.getManyElements(this.#currentSelection);

        const applyScale = (oldBounds: Bounds) => {

            const rel_min_x = oldBounds.minX - this.#initialBounds.minX;
            const rel_min_y = oldBounds.minY - this.#initialBounds.minY;
            const rel_max_x = oldBounds.maxX - this.#initialBounds.minX;
            const rel_max_y = oldBounds.maxY - this.#initialBounds.minY;

            let new_min_x = 0;
            let new_min_y = 0;
            let new_max_x = 0;
            let new_max_y = 0;


            new_min_x = newMinX + scaleX * rel_min_x;
            new_min_y = newMinY + scaleY * rel_min_y;
            new_max_x = newMinX + scaleX * rel_max_x;
            new_max_y = newMinY + scaleY * rel_max_y;

            const newBounds = {
                minX: new_min_x,
                minY: new_min_y,
                maxX: new_max_x,
                maxY: new_max_y,
            } as Bounds;
            return newBounds;
        }

        this.#options.onScaleProgress(applyScale, selectedItems, done);

        this.#currentBounds = {
            minX: newMinX,
            minY: newMinY,
            maxX: newMaxX,
            maxY: newMaxY,
        } as Bounds;

        this.showTransformGraphics(this.#currentBounds, []);

        return this.#currentBounds;
    }

    private reparentSelectionToTransformContainer(items: TransformElement[]) {
        for (const sel of items) {
            this.#transformItemsWrap?.reparentChild(sel.element.graphics);
        }
    }

    private startScale() {
        const selectedDraggableItems = this.getManyElements(this.#currentSelection);

        this.reparentSelectionToTransformContainer(selectedDraggableItems);

        for (const item of selectedDraggableItems) {
            if (item.scalable) {
                item.scalable?.onStart?.();
            }
        }
    }

    private endScale(offset: Point, rel: string) {

        const lastBounds = this.handleScale(offset, rel , true);

        const selectedScalableItems = this.getManyElements(this.#currentSelection);
        for (const sel of selectedScalableItems) {
            if (sel.element.graphics.parent !== this.#viewport) {
                this.#viewport?.reparentChild(sel.element.graphics);
                if (sel.scalable) {
                    sel.scalable.onEnd?.(offset);
                }
            }
        }

        this.#initialBounds = lastBounds;
        this.#currentBounds = null;

        this.showTransformGraphics(this.#initialBounds, []);
    }

    private handleStartLeftTopResize() {
        this.startScale();
    }

    private handleMoveLeftTopResize(offset: Point) {
        this.handleScale(offset, "lt" , false);
    }

    private handleEndLeftTopResize(offset: Point) {
        this.endScale(offset, "lt");
    }

    // Right Bottom Drag Handle

    private handleStartRightBottomResize() {
        this.startScale();
    }

    private handleMoveRightBottomResize(offset: Point) {
        this.handleScale(offset, "rb",false);
    }

    private handleEndRightBottomResize(offset: Point) {
        this.endScale(offset, "rb");
    }

    //End Right Bottom Drag Handle

    // Left Bottom Drag Handle

    private handleStartLeftBottomResize() {
        this.startScale();
    }

    private handleMoveLeftBottomResize(offset: Point) {
        this.handleScale(offset, "lb" , false);
    }

    private handleEndLeftBottomResize(offset: Point) {
        this.endScale(offset, "lb");
    }

    //End Left Bottom Drag Handle


    // Right Top Drag Handle

    private handleStartRightTopResize() {
        this.startScale();
    }

    private handleMoveRightTopResize(offset: Point) {
        this.handleScale(offset, "rt" , false);
    }

    private handleEndRightTopResize(offset: Point) {
        this.endScale(offset, "rt");
    }

    //End Right Top Drag Handle

    private handleStartMove() {
        const selectedDraggableItems = this.getManyElements(this.#currentSelection);
        this.reparentSelectionToTransformContainer(selectedDraggableItems);
    }

    private handleMove(offset: Point) {
        const selectedDraggableItems = this.getManyElements(this.#currentSelection);

        const offsetX = this.#cumulativeOffset.x + offset.x;
        const offsetY = this.#cumulativeOffset.y + offset.y;
        for (const sel of selectedDraggableItems) {
            this.#transformContainer?.position.set(offsetX, offsetY);
        }
    }

    private async handleEndMove(offset: Point) {
        const selectedDraggableItems = this.getManyElements(this.#currentSelection);
        for (const sel of selectedDraggableItems) {
            this.#viewport?.reparentChild(sel.element.graphics);
            sel.element.graphics.position.set(0, 0);
        }
        this.#options.onMoveProgress(new Point(offset.x, offset.y), selectedDraggableItems);
        this.#cumulativeOffset = new Point(offset.x + this.#cumulativeOffset.x, offset.y + this.#cumulativeOffset.y);

        await tick();

        this.hideTransformGraphics();
        this.handleSelectionChange(this.#currentSelection);
    }

    private findMinMaxBounds(elements: WhiteboardElement[]): [Bounds, Bounds[]] {
        let minX = null as unknown as number;
        let minY = null as unknown as number;
        let maxX = null as unknown as number;
        let maxY = null as unknown as number;

        let allBounds: Bounds[] = [];

        for (const el of elements) {
            const bounds = el.graphics.getBounds();

            allBounds.push(bounds);

            if (!minX || bounds.minX < minX) {
                minX = bounds.minX;
            }

            if (!minY || bounds.minY < minY) {
                minY = bounds.minY;
            }

            if (!maxX || bounds.maxX > maxX) {
                maxX = bounds.maxX;
            }

            if (!maxY || bounds.maxY > maxY) {
                maxY = bounds.maxY;
            }
        }

        const minmaxBounds = new Bounds(minX, minY, maxX, maxY);

        return [minmaxBounds, allBounds];
    }

    private updateTransformGraphics() {

        const container = this.#transformControlContainer!;
        const bounds = this.#currentBounds ?? this.#initialBounds;

        if (!container) {
            return;
        }

        const w = 10;
        const hw = w / 2;

        function createOrGetScaleGr(label: string, pos: { x: number, y: number }, cursor: string, shape: "rect" | "circle", onReady: (gr: Graphics) => void) {

            const existing = container.getChildByLabel(label) as Graphics;

            const gr = existing ?? new Graphics();
            gr.zIndex = Number.POSITIVE_INFINITY;
            gr.cursor = cursor;
            gr.eventMode = "static";
            gr.label = label;

            if (!existing) {
                container.addChild(gr);
                onReady(gr);
            }

            gr.clear();

            if (shape === "rect") {
                gr.roundRect(pos.x - hw, pos.y - hw, w, w, 2).setStrokeStyle("#0f0").stroke().setFillStyle({
                    color: "#aaa",
                    alpha: 0.3
                }).fill();
            } else {
                gr.circle(pos.x, pos.y, w / 2).setStrokeStyle("#0f0").stroke().setFillStyle({
                    color: "#aaa",
                    alpha: 0.3
                }).fill();
            }
        }

        createOrGetScaleGr("scale1", { x: bounds.minX, y: bounds.minY }, "nw-resize", "rect", (gr) => this.#leftTopScaleGraphics = gr);
        createOrGetScaleGr("scale2", { x: bounds.maxX, y: bounds.minY }, "ne-resize", "rect", (gr) => this.#rightTopScaleGraphics = gr);
        createOrGetScaleGr("scale3", { x: bounds.minX, y: bounds.maxY }, "ne-resize", "rect", (gr) => this.#leftBottomScaleGraphics = gr);
        createOrGetScaleGr("scale4", { x: bounds.maxX, y: bounds.maxY }, "nw-resize", "rect", (gr) => this.#rightBottomScaleGraphics = gr);
        createOrGetScaleGr("rotate", { x: bounds.minX + (bounds.maxX - bounds.minX) / 2, y: bounds.minY - 20 }, "grab", "circle", (gr) => this.#rotateGraphics = gr);
    }

    private showTransformGraphics(bounds: Bounds, allBounds: Bounds[]) {
        if (this.#container) {
            if (!this.#transformGraphics) {
                this.#transformContainer = new Container({
                    isRenderGroup: true
                });

                this.#transformControlContainer = new Container({
                    isRenderGroup: true
                })

                this.#transformItemsWrap = new Container({
                    isRenderGroup: true,
                    label: "itemsWrap"
                })

                this.#transformGraphics = new Graphics();
                this.#transformGraphics.eventMode = "static";
                this.#transformGraphics.cursor = "move";

                this.#transformContainer?.addChild(this.#transformItemsWrap);
                this.#transformItemsWrap?.addChild(this.#transformGraphics);
                this.#transformContainer?.addChild(this.#transformControlContainer);

                this.#transformContainer.zIndex = Number.POSITIVE_INFINITY - 1;

                this.#transformControlContainer.zIndex = Number.POSITIVE_INFINITY;

                this.#viewport.addChild(this.#transformContainer);
            }

            this.updateTransformGraphics();
            this.#transformGraphics.clear();

            for (const bound of allBounds) {
                const pad = 5;
                const p1 = this.#viewport.toWorld(bound.minX, bound.minY);
                const p2 = this.#viewport.toWorld(bound.maxX, bound.maxY);

                drawRect(this.#transformGraphics, p1.x - pad, p1.y - pad, p2.x + pad, p2.y + pad, {
                    stroke: {
                        color: "#aaa",
                        width: 1
                    }
                });
            }

            const minPt = this.#viewport.toWorld(bounds.minX, bounds.minY);
            const maxPt = this.#viewport.toWorld(bounds.maxX, bounds.maxY);

            const pad = 5;

            drawRect(this.#transformGraphics, minPt.x - pad, minPt.y - pad, maxPt.x + pad, maxPt.y + pad, {
                fill: {
                    color: "#0000ee05",
                },
                stroke: {
                    color: "#458",
                    width: 3,
                }
            });
        }
    }

    private hideTransformGraphics() {
        if (this.#transformContainer) {
            this.#viewport.removeChild(this.#transformContainer);
            this.#transformGraphics = null;
        }
    }

    private handleSelectionChange(selection: WhiteboardElement[]) {
        if (!this.#container) {
            return;
        }

        this.#cumulativeOffset = new Point(0, 0);

        this.refreshBounds(selection);
    }

    private refreshBounds(selection: WhiteboardElement[]) {
        if (selection.length) {
            const [bounds, allBounds] = this.findMinMaxBounds(selection);

            this.#initialBounds = bounds;
            this.showTransformGraphics(bounds, allBounds);
        } else {
            this.hideTransformGraphics();
        }
    }

    registerElement(element: WhiteboardElement, options: Pick<ElementRegisterOptions<any>, 'draggable' | 'rotatable' | 'scalable'>) {

        const existingElementIndex = this.#elements.findIndex(e => e.element.uid === element.uid);

        if (existingElementIndex >= 0) {
            this.#elements.splice(existingElementIndex, 1);
        }

        let de: TransformElement = {
            element: element,
            ...options
        };

        this.#elements.push(de);
    }

    unRegisterElement(element: WhiteboardElement) {
        const index = this.#elements.findIndex(e => e.element.uid === element.uid);

        if (index < 0) {
            return;
        }

        this.#elements.splice(index, 1);
    }

    isElementRegistered(element: WhiteboardElement) {
        return Boolean(this.#elements.find((e) => e.element.uid === element.uid));
    }

    getManyElements(elements: WhiteboardElement[]) {
        const ids = elements.map(e => e.uid);
        return this.#elements.filter(e => ids.includes(e.element.uid));
    }
}