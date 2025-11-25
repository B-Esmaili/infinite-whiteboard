import { unwrapValue } from "$lib/utils/misc.ts";
import type { MaybeUnwrap } from "$lib/utils/types.ts";
import type { ApplicationOptions } from "pixi.js";
import { Application as PixiApp } from "pixi.js"
import type { AppContext, ContainerContext, ToolboxItem } from "./types.ts";
import { setContext } from "svelte";
import { Toolbar, type ToolbarItem } from "./toolbar/toolbar.svelte.ts";
import ToolboxItems from "./toolbox-items";

export interface ApplicaionProps {
    element: HTMLCanvasElement;
    appProps?: Partial<ApplicationOptions>;
}

export class Application {
    #props: ApplicaionProps;
    #app: PixiApp | null = null;
    #appContext = $state<AppContext>({} as AppContext);
    #containerContext = $state<ContainerContext>({} as ContainerContext);
    //#toolboxItems = $state<ToolboxItem>();
    constructor(_props: MaybeUnwrap<ApplicaionProps>) {
        this.#props = $derived(unwrapValue(_props));
        this.init();
    }

    init() {
        function toolboxToToolbarItem(_item: ToolboxItem): ToolbarItem {
            return {
                name: _item.manifest.name,
                displayName: _item.manifest.displayName,
                icon: _item.manifest.icon
            } as ToolbarItem
        }

        const items = ToolboxItems.map(item => ({
            ...toolboxToToolbarItem(item),
            items: ToolboxItems.filter(e => e.manifest.parent === item.manifest.name).map(toolboxToToolbarItem)
        }));

        new Toolbar(() => ({
            items,
            onChange: (newItem?: ToolbarItem) => {
                if (newItem === undefined){
                    this.#appContext.activeTool = undefined;
                    return;
                }
                const newTool = ToolboxItems.find(e => e.manifest.name === newItem.name);
                if (newTool) {
                    this.#appContext.activeTool = newTool;
                }
            }
        }));

        this.#appContext = {
            toolboxItems: ToolboxItems,
        } as AppContext;

        setContext("whiteboard-context", this.#appContext);
        setContext("container-context", this.#containerContext);

        ToolboxItems.forEach(e => e.handler());

        $effect(() => {
            (async () => {
                const _app = new PixiApp();
                const element = this.#props.element;
                await _app.init({ ... this.#props.appProps, canvas: element, resizeTo: element! });
                this.#app = _app;
                this.#appContext.app = _app;
                this.#appContext.element = element;
                this.#containerContext.container = _app.stage;
            })()
        });
    }

    get ready() {
        return Boolean(this.#appContext?.app);
    }
}