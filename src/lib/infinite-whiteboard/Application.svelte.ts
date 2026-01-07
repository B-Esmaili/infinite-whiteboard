import { unwrapValue } from "$lib/utils/misc.ts";
import type { MaybeUnwrap } from "$lib/utils/types.ts";
import { Container, Graphics, Point, type ApplicationOptions, type Bounds } from "pixi.js";
import { Application as PixiApp } from "pixi.js"
import type { AppContext, ContainerContext, ToolboxItem, ViewportContext, WhiteboardElement } from "./types.ts";
import { mount, setContext, unmount } from "svelte";
import { Toolbar, type ToolbarItem } from "./toolbar/toolbar.svelte.ts";
import ToolboxItems from "./toolbox-items";
import type { Grid } from "./grid.svelte.ts";
import ViewPort from "./widgets/view-port.svelte";
import { watch } from "runed";
import { SvelteMap } from "svelte/reactivity";
import { Selection } from "./selection.svelte.ts";
import { AddElementUndoCommand } from "./commands/add-object-command.ts";
import { CommandManager } from "./commands/command-history.svelte.ts";
import { v4 as uuidv4 } from 'uuid';
import { TransformManager, type TransformElement } from "./helpers/transform-manager.svelte.ts";

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
    #selection = $state<Selection | undefined>();
    #commandManager: CommandManager = null as unknown as CommandManager;
    #viewInstances = new Map<string, any>;
    #transformManager: TransformManager | null = null;
    #transformContainer = $state<Container>();

    constructor(_props: MaybeUnwrap<ApplicaionProps>) {
        this.#props = $derived(unwrapValue(_props));
        this.init();
    }

    addElement(element: WhiteboardElement) {
        element.uid = uuidv4();
        this.addElementInternal(element);

        const _this = this;

        const cmd = new AddElementUndoCommand(() => {
            _this.removeElementInternal(element.uid);
        }, () => {
            _this.addElementInternal(cmd.getElement());
        }, element);

        this.#commandManager.addCommand(cmd);
    }

    private addElementInternal(element: WhiteboardElement) {
        this.#elements.push(element);

        element.graphics = new Graphics();

        element.updateViewModel = (payload) => {
            element.viewModel = {
                ...element.viewModel,
                ...payload
            };
        }

        element.register = (el, options) => {
            const viewport = this.#viewportContex.viewport;
            viewport.addChild(el.graphics);


            if (options.selectable) {
                this.registerSelection(el);
            }

            if (options.draggable || options.scalable || options.rotatable) {
                this.#transformManager?.registerElement(element, {
                    draggable: options.draggable,
                    scalable: options.scalable,
                    rotatable: options.rotatable,
                });
            }
        };

        element.unRegister = (el) => {
            this.#viewportContex.viewport.removeChild(el.graphics);

            if (this.#selection?.isElementRegistered(el)) {
                this.unRegisterSelection(el);
            }

            if (this.#transformManager?.isElementRegistered(el)) {
                this.#transformManager.unRegisterElement(el);
            }
        };

        const el = this.#elements[this.#elements.length - 1]; // Get element from $state list so that we be able to update it 

        const instance = mount(element.view, {
            target: document.body,
            props: el,
            context: this.#contexts,
        });

        this.#viewInstances.set(element.uid, instance);
    }

    private removeElementInternal(uid: string) {
        const elToRemoveIndex = this.#elements.findIndex(e => e.uid === uid);

        if (elToRemoveIndex < 0) {
            return;
        }

        const el = this.#elements.at(elToRemoveIndex)

        this.#elements.splice(elToRemoveIndex, 1);

        if (el?.uid && el) {
            const viewInstance = this.#viewInstances.get(el.uid);

            if (viewInstance) {
                this.#viewInstances.delete(el.uid);
                unmount(viewInstance);
            }
        }

        return el;
    }   

    removeElement(uid: string) {
        this.removeElementInternal(uid);
    }

    private updateElementInternal(uid: string, viewModel: Record<PropertyKey, unknown>) {
        const el = this.#elements.find(e => e.uid === uid);

        if (el) {
            el.viewModel = $state.snapshot(viewModel);
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
            getElementsInRange: this.getElementsInRange.bind(this),
            setSelectedElements: this.setSelectedElements.bind(this),
            getSelectedElements: this.getSelectedElements.bind(this)
        } as AppContext;

        setContext("whiteboard-context", this.#appContext);
        setContext("container-context", this.#containerContext);

        let grid = $state<Grid>();

        this.#contexts.set("whiteboard-context", this.#appContext);
        this.#contexts.set("container-context", this.#containerContext);

        this.#transformContainer = new Container({
            isRenderGroup: true
        });

        let viewPortProps = $state({
            enablePan: false,
            grid,
            toolboxItems: ToolboxItems,
            transformContainer: this.#transformContainer as Container,
            onReady: (ctx: ViewportContext) => {
                this.#contexts.set("viewport-context", ctx);
                this.#viewportContex = ctx;
                this.#selection = new Selection({});
            }
        });

        const viewportView = mount(ViewPort, {
            target: document.body,
            props: viewPortProps
        });

        watch(() => enablePan, (enablePan) => {
            viewPortProps.enablePan = enablePan;
        });

        this.#ready = true;

        this.#commandManager = new CommandManager(this.#viewportContex);

        this.#transformManager = new TransformManager(() => this.#containerContext?.container, () => this.#viewportContex?.viewport, () => this.#selection!, {
            onMoveProgress: (offset: Point, elements: TransformElement[]) => {
                for (const el of elements) {
                    if (el.draggable) {
                        const updatedVm = el.draggable?.moveAdapter?.(el.element, offset) ?? el.element.viewModel;
                        this.updateElementInternal(el.element.uid, updatedVm);
                    }
                }
            },
            onScaleProgress: (applyScale: (bounds: Bounds) => Bounds, elements: TransformElement[], done: boolean) => {
                for (const el of elements) {
                    if (el.scalable) {
                        const updatedData = el.scalable.scaleAdapter?.(el.element, applyScale, done) ?? el.element.viewModel;
                        if (done) {
                            this.updateElementInternal(el.element.uid, updatedData);
                        } else {
                            el.element.graphics.context = updatedData;
                        }
                    }
                }
            }
        });

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
                const _this = this;
            })()

            return () => {
                unmount(viewportView);
            }
        });
    }

    private registerSelection(el: WhiteboardElement) {
        this.#selection?.addElement(el);
    }

    private unRegisterSelection(el: WhiteboardElement) {
        this.#selection?.removeElement(el);
    }

    private getElementsInRange(bounds: Bounds): WhiteboardElement[] {
        return this.#selection?.getElementsInRange(bounds) ?? [];
    }

    private setSelectedElements(elements: WhiteboardElement[]) {
        this.#selection?.setCurrentSelection(elements);
    }

    private getSelectedElements(): WhiteboardElement[] {
        return this.#selection?.currentSelection ?? [];
    }

    get ready() {
        return this.#ready;
    }
}