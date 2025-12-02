import { unwrapValue } from "$lib/utils/misc.ts";
import type { MaybeUnwrap } from "$lib/utils/types.ts";
import { Graphics, type ApplicationOptions, type Bounds } from "pixi.js";
import { Application as PixiApp } from "pixi.js"
import type { AppContext, ContainerContext, ToolboxItem, ViewportContext, WhiteboardElement } from "./types.ts";
import { mount, setContext, tick, unmount } from "svelte";
import { Toolbar, type ToolbarItem } from "./toolbar/toolbar.svelte.ts";
import ToolboxItems from "./toolbox-items";
import type { Grid } from "./grid.svelte.ts";
import ViewPort from "./widgets/view-port.svelte";
import { watch } from "runed";
import { SvelteMap } from "svelte/reactivity";
import { Selection } from "./selection.svelte.ts";

export interface ApplicaionProps {
    element: HTMLCanvasElement;
    appProps?: Partial<ApplicationOptions>;
}

export class Application {
    #props: ApplicaionProps;
    #app: PixiApp | null = null;
    #viewportContex = $state<ViewportContext>({} as ViewportContext);
    #appContext = $state<AppContext>({} as AppContext);
    #containerContext = $state<ContainerContext>({} as ContainerContext);
    #elements = $state<WhiteboardElement[]>([]);
    #ready = false;
    #contexts = new SvelteMap<string, unknown>();
    #selection: Selection | undefined;

    constructor(_props: MaybeUnwrap<ApplicaionProps>) {
        this.#props = $derived(unwrapValue(_props));
        this.init();
    }

    addElement(element: WhiteboardElement) {

        this.#elements.push(element);

        element.graphics = new Graphics();

        element.register = (el, options) => {
            const viewport = this.#viewportContex.viewport;
            viewport.addChild(el.graphics);
            if (options.selectable) {
                this.registerSelection(el);
            }
        };

        element.unRegister = (el) => {
            this.#viewportContex.viewport.addChild(el.graphics);
            if (this.#selection?.isElementRegistered(el)) {
                this.unRegisterSelection(el);
            }
        };

        mount(element.view, {
            target: document.body,
            props: element,
            context: this.#contexts,
        });
    }

    removeElement(uid: string) {
        const elToRemoveIndex = this.#elements.findIndex(e => e.uid === uid);

        if (elToRemoveIndex < 0) {
            return;
        }

        const view = this.#elements.at(elToRemoveIndex)?.view;

        this.#elements.splice(elToRemoveIndex, 1);

        if (view) {
            unmount(view);
        }
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
            addElement: this.addElement.bind(this),
            removeElement: this.removeElement.bind(this),
            getSelectedElements: this.getSelectedElements.bind(this),
        } as AppContext;

        setContext("whiteboard-context", this.#appContext);
        setContext("container-context", this.#containerContext);

        let grid = $state<Grid>();


        this.#contexts.set("whiteboard-context", this.#appContext);
        this.#contexts.set("container-context", this.#containerContext);

        let viewPortProps = $state({
            enablePan: enablePan,
            grid,
            toolboxItems: ToolboxItems,
            onReady: (ctx: ViewportContext) => {
                this.#contexts.set("viewport-context", ctx);
                this.#viewportContex = ctx;
                this.#selection = new Selection({});
            }
        });

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

    private registerSelection(el: WhiteboardElement) {
        this.#selection?.addElement(el);
    }

    private unRegisterSelection(el: WhiteboardElement) {
        this.#selection?.removeElement(el);
    }

    private getSelectedElements(bounds: Bounds): WhiteboardElement[] {
        return this.#selection?.getSelectedItems(bounds) ?? [];
    }

    get ready() {
        return this.#ready;
    }
}