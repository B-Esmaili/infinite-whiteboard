import { Bounds, Graphics } from "pixi.js";
import { extract, type MaybeGetter } from "runed";
import type { AppContext, ViewportContext, WhiteboardElement } from "./types";
import RBush, { type BBox } from 'rbush';
import { getViewPortContext } from "./context.svelte";

export interface SelectionOptions {
    onSelectionChange?: (selectedElements: WhiteboardElement[]) => void;
}

export interface RBrushItem extends BBox {
    ref: WhiteboardElement
}

export class Selection {

    #options: SelectionOptions;
    #tree: RBush<RBrushItem> = new RBush();
    #viewportContext: ViewportContext;
    #currentSelection = $state<WhiteboardElement[]>([]);

    constructor(options: MaybeGetter<SelectionOptions>) {
        this.#options = $derived(extract(options));
        this.#viewportContext = getViewPortContext();
    }

    addElement(gr: WhiteboardElement | WhiteboardElement[]) {
        const items = Array.isArray(gr) ? gr as WhiteboardElement[] : [gr];

        const itemsWithBounds = items.map((item) => {
            const bounds = item.graphics.getBounds();

            const p1 = this.#viewportContext.viewport.toWorld(bounds.minX, bounds.minY);
            const p2 = this.#viewportContext.viewport.toWorld(bounds.maxX, bounds.maxY);

            return {
                minX: p1.x,
                minY: p1.y,
                maxX: p2.x,
                maxY: p2.y,
                ref: item
            } as RBrushItem
        });

        if (itemsWithBounds.length === 1) {
            this.#tree.insert(itemsWithBounds[0]);
        } else {
            this.#tree.load(itemsWithBounds);
        }
    }

    removeElement(el: WhiteboardElement) {
        const item = this.#tree.all().find(e => e.ref === el);

        if (item) {
            this.#tree.remove(item);
        }
    }

    isElementRegistered(el: WhiteboardElement | string) {
        const el_id = typeof el === "string" ? el : el.uid;
        return this.#tree.all().some(e => e.ref.uid === el_id);
    }

    getElementsInRange(bounds: BBox) {

        if (!this.#viewportContext) {
            return [];
        }

        let items = this.#tree.search(bounds).map(x => x.ref);
        return items;
    }

    setCurrentSelection(elements: WhiteboardElement[]) {
        this.#currentSelection = elements;
        this.#options.onSelectionChange?.(elements);
    }

    get currentSelection(): WhiteboardElement[] {
        return this.#currentSelection;
    }
}