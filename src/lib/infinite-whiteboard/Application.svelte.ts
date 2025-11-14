import { unwrapValue } from "$lib/utils/misc.ts";
import type { MaybeUnwrap } from "$lib/utils/types.ts";
import type { ApplicationOptions, Container } from "pixi.js";
import { Application as PixiApp } from "pixi.js"
import type { AppContext } from "./types.ts";
import { setContext } from "svelte";

export interface ApplicaionProps {
    element: HTMLCanvasElement;
    appProps?: Partial<ApplicationOptions>
}

export class Application {
    #props: ApplicaionProps;
    #app: PixiApp | null = null;
    #appContext = $state<AppContext>({} as AppContext);
    constructor(_props: MaybeUnwrap<ApplicaionProps>) {
        this.#props = $derived(unwrapValue(_props));
        this.init();
    }

    init() {

        this.#appContext = {} as AppContext;
        setContext("whiteboard-context", this.#appContext);

        $effect(() => {
            (async () => {
                const _app = new PixiApp();
                const element = this.#props.element;
                await _app.init({ ... this.#props.appProps, canvas: element });
                this.#app = _app;

                this.#appContext.app = _app;
            })()
        });
    }

    get ready() {
        return Boolean(this.#appContext?.app);
    }
}