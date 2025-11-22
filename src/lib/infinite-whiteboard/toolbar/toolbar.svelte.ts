import { setContext, type Component } from "svelte";
import { Square, Hand, Diamond, MousePointer2 } from '@lucide/svelte';

export interface ToolbarItem {
    name: string;
    displayName: string;
    icon: Component;
    items?: ToolbarItem[]
}

export interface ToolbarContext {
    activeItem: ToolbarItem;
    items: ToolbarItem[];
    setActiveItem: (item: ToolbarItem) => void;
}

const defaultItems: ToolbarItem[] = [{
    name: "selection",
    displayName: "Selection",
    icon: MousePointer2
},
{
    name: "pan",
    displayName: "Pan",
    icon: Hand
},
{
    name: "rect",
    displayName: "Rect",
    icon: Square
}, {
    name: "diamond",
    displayName: "Diamond",
    icon: Diamond
},
{
    name: "diamond2",
    displayName: "Diamond",
    icon: Diamond,
    items: [
        {
            name: "pan2",
            displayName: "Pan 2",
            icon: Hand
        },
        {
            name: "rect2",
            displayName: "Rect 2",
            icon: Square,
            items: [
                {
                    name: "pan3",
                    displayName: "Pan 3",
                    icon: Hand
                },
                {
                    name: "rect3",
                    displayName: "Rect 3",
                    icon: Square
                }
            ]
        }
    ]
}];

export class Toolbar {
    activeItem = $state<ToolbarItem>(defaultItems[0]);
    context = $state<ToolbarContext>({ items: defaultItems } as ToolbarContext);
    items = $state<ToolbarItem[]>(defaultItems);

    constructor() {
        this.context.activeItem = this.activeItem;
        this.context.setActiveItem = this.setActiveItem.bind(this);

        setContext("toolbar-context", this.context);
    }

    setActiveItem(item: ToolbarItem) {
        this.activeItem = item;
        this.context.activeItem = item;
    }
}