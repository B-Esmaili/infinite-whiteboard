import { mount, setContext, type Component } from "svelte";
import ToolbarView from "./toolbar-view.svelte";
import { extract, watch, type MaybeGetter } from "runed";

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

export interface ToolbarProps{
    items: ToolbarItem[];
    onChange? : (newItem : ToolbarItem | undefined)=>void;
}

export class Toolbar {
    activeItem = $state<ToolbarItem>();
    context = $state<ToolbarContext>({} as ToolbarContext);
    items = $state<ToolbarItem[]>();
    #options = $state<ToolbarProps>();

    constructor(options:MaybeGetter<ToolbarProps>) {  
        this.#options = extract(options);
        const _options = this.#options;
        this.items = _options.items;
        this.context.activeItem = this.activeItem!;
        this.context.items = this.items;
        this.context.setActiveItem = this.setActiveItem.bind(this);

        setContext("toolbar-context", this.context);

        $effect(() => {
            mount(ToolbarView, {
                target: document.body
            });
        });

        watch(()=> this.activeItem , (newItem)=>{
            this.#options?.onChange?.(newItem);
        })
    }

    setActiveItem(item: ToolbarItem) {
        this.activeItem = item;
        this.context.activeItem = item;
    }
}