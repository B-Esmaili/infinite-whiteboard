import { extract, watch, type MaybeGetter } from "runed";
import type { DraggableOptions, WhiteboardElement } from "../types";
import { Bounds, Container, Graphics, Point } from "pixi.js";
import type { Selection } from "../selection.svelte";
import { drawRect } from "./drawing-helper";
import type { Viewport } from "pixi-viewport";
import { DragDropHelper } from "./drag-drop-helper.svelte";


export interface DragDropOptions {
    onMove: (offset: Point, elements: TransformElement[]) => void;
}

export interface TransformElement {
    element: WhiteboardElement;
    options: DraggableOptions;
}

export class TransformManager {
    #options: DragDropOptions;
    #container: Container;
    #viewport: Viewport;
    #elements: TransformElement[] = [];
    #isDown = false;
    #startPos: Point | null = null;
    #selection: Selection;
    #transformGraphics = $state<Graphics | null>(null);
    #transformContainer = $state<Container | null>(null);
    #dragdropHelper: DragDropHelper;
    #cumulativeOffset = new Point(0, 0);

    constructor(container: MaybeGetter<Container>, viewport: MaybeGetter<Viewport>, selection: MaybeGetter<Selection>, options: MaybeGetter<DragDropOptions>) {
        this.#options = $derived(extract(options));
        this.#container = $derived(extract(container));
        this.#selection = $derived(extract(selection));
        this.#viewport = $derived(extract(viewport));

        this.#dragdropHelper = new DragDropHelper(() => this.#transformGraphics, () => this.#viewport, () => ({
            onStart: this.handleStartMove.bind(this),
            onMove: this.handleMove.bind(this),
            onEnd: this.handleEndMove.bind(this),
        }));

        watch(() => this.#selection?.currentSelection ?? [], this.handleSelectionChange.bind(this))
    }

    private handleStartMove() {
        const selectedDraggableItems = this.getManyElements(this.#selection.currentSelection);
        for (const sel of selectedDraggableItems) {
            this.#transformContainer?.reparentChild(sel.element.graphics);
        }
    }

    private handleMove(offset: Point) {
        const selectedDraggableItems = this.getManyElements(this.#selection.currentSelection);
        const offsetX = this.#cumulativeOffset.x + offset.x;
        const offsetY = this.#cumulativeOffset.y + offset.y;
        for (const sel of selectedDraggableItems) {
            //const worldTransform = this.#viewport.toWorld(offsetX, offsetY);
            //sel.options.onMove?.(worldTransform);
            this.#transformContainer?.position.set(offsetX, offsetY);
        }
    }

    private handleEndMove(offset: Point) {
        const selectedDraggableItems = this.getManyElements(this.#selection.currentSelection);
        //const offsetX = this.#cumulativeOffset.x + offset.x;
        //const offsetY = this.#cumulativeOffset.y + offset.y;
        for (const sel of selectedDraggableItems) {
            this.#viewport?.reparentChild(sel.element.graphics);
            sel.element.graphics.position.set(0, 0);
        }
        this.#options.onMove(new Point(offset.x, offset.y), selectedDraggableItems);
        this.#cumulativeOffset = new Point(offset.x + this.#cumulativeOffset.x, offset.y + this.#cumulativeOffset.y);
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

        const pad = 10;

        const minmaxBounds = new Bounds(minX - pad, minY - pad, maxX + pad, maxY + pad);

        return [minmaxBounds, allBounds];
    }

    private showTransformGraphics(selection: WhiteboardElement[]) {
        if (this.#container) {
            if (!this.#transformGraphics) {
                this.#transformContainer = new Container({
                    isRenderGroup: true
                });
                this.#transformGraphics = new Graphics();
                this.#transformGraphics.eventMode = "static";
                this.#transformGraphics.cursor = "move";
                this.#transformContainer?.addChild(this.#transformGraphics);
                this.#transformContainer.zIndex = Number.POSITIVE_INFINITY;
                this.#viewport.addChild(this.#transformContainer);
            }
            
            this.#transformContainer?.position.set(0, 0);
            const [bounds, allBounds] = this.findMinMaxBounds(selection);
            this.#transformGraphics.clear();

            for (const bound of allBounds) {
                const pad = 10;
                const p1 = this.#viewport.toWorld(bound.minX, bound.minY);
                const p2 = this.#viewport.toWorld(bound.maxX, bound.maxY);

                drawRect(this.#transformGraphics, p1.x - pad, p1.y - pad, p2.x + pad, p2.y + pad, {
                    stroke: "#aaa"
                });
            }

            const x = this.#viewport.toWorld(bounds.minX, bounds.minY);
            const y = this.#viewport.toWorld(bounds.maxX, bounds.maxY);

            drawRect(this.#transformGraphics, x.x, x.y, y.x, y.y, {
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

        if (selection.length) {
            this.showTransformGraphics(selection);
        } else {
            this.hideTransformGraphics();
        }
    }

    // private isGraphicsRegistered(gr: Graphics): boolean {
    //     for (let i = 0; i < this.#elements.length; i++) {
    //         const el = this.#elements[i];
    //         if (el.element.graphics === gr) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    registerElement(element: WhiteboardElement, options: DraggableOptions) {
        const existingElementIndex = this.#elements.findIndex(e => e.element.uid === element.uid);

        if (existingElementIndex >= 0) {
            this.#elements.splice(existingElementIndex, 1);
        }

        let de: TransformElement = {
            element: element,
            options,
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