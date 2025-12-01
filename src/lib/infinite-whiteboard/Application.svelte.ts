import { unwrapValue } from "$lib/utils/misc.ts";
import type { MaybeUnwrap } from "$lib/utils/types.ts";
import type { ApplicationOptions } from "pixi.js";
import { Application as PixiApp } from "pixi.js"
import type { AppContext, ContainerContext, ToolboxItem, ViewportContext, WidgetModel } from "./types.ts";
import { mount, setContext, tick } from "svelte";
import { Toolbar, type ToolbarItem } from "./toolbar/toolbar.svelte.ts";
import ToolboxItems from "./toolbox-items";
import type { Grid } from "./grid.svelte.ts";
import ViewPort from "./widgets/view-port.svelte";
import { watch } from "runed";
import { SvelteMap } from "svelte/reactivity";

export interface ApplicaionProps {
    element: HTMLCanvasElement;
    appProps?: Partial<ApplicationOptions>;
}



export class Application {
    #props: ApplicaionProps;
    #app: PixiApp | null = null;
    #appContext = $state<AppContext>({} as AppContext);
    #containerContext = $state<ContainerContext>({} as ContainerContext);
    #widgets = $state<WidgetModel[]>([]);
    #ready = false;
    #contexts = new SvelteMap<string, unknown>();
    //#toolboxItems = $state<ToolboxItem>();
    constructor(_props: MaybeUnwrap<ApplicaionProps>) {
        this.#props = $derived(unwrapValue(_props));
        this.init();
    }


    addWidget(widgetModel: WidgetModel) {
        this.#widgets.push(widgetModel);
        mount(widgetModel.widget, {
            target: document.body,
            props: widgetModel.widgetModel,
            context: this.#contexts
        });
    }

    init() {
        function toolboxToToolbarItem(_item: ToolboxItem): ToolbarItem {
            return {
                name: _item.manifest.name,
                displayName: _item.manifest.displayName,
                icon: _item.manifest.icon
            } as ToolbarItem
        }

        let enablePan = $derived.by(() => this.#appContext?.activeTool?.manifest.name === "pan");

        const items = ToolboxItems.map(item => ({
            ...toolboxToToolbarItem(item),
            items: ToolboxItems.filter(e => e.manifest.parent === item.manifest.name).map(toolboxToToolbarItem)
        }));

        new Toolbar(() => ({
            items,
            onChange: (newItem?: ToolbarItem) => {
                if (newItem === undefined) {
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
            addWidget: this.addWidget.bind(this)
        } as AppContext;

        setContext("whiteboard-context", this.#appContext);
        setContext("container-context", this.#containerContext);

        let grid = $state<Grid>();

        let viewPortProps = $state({
            enablePan: enablePan,
            grid,
            toolboxItems: ToolboxItems,
            onReady: (ctx : ViewportContext) => {
                this.#contexts.set("viewport-context", ctx);
            }
        });

        this.#contexts.set("whiteboard-context", this.#appContext);
        this.#contexts.set("container-context", this.#containerContext);

        mount(ViewPort, {
            target: document.body,
            props: viewPortProps
        });



        watch(() => enablePan, (enablePan) => {
            viewPortProps.enablePan = enablePan;
        });

        this.#ready = true;

        $effect(() => {
            (async () => {
                const _app = new PixiApp();

                const element = this.#props.element;
                await _app.init({ ... this.#props.appProps, canvas: element, resizeTo: element! });

                _app.stage.eventMode = 'static';
                _app.stage.hitArea = _app.renderer.screen;

                this.#app = _app;
                this.#appContext.app = _app;
                this.#appContext.element = element;
                this.#containerContext.container = _app.stage;
            })()
        });
    }

    get ready() {
        return this.#ready;
    }
}