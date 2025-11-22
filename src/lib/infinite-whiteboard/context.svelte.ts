import { getContext, setContext } from "svelte";
import type { AppContext, ContainerContext, ViewportContext } from "./types.ts";
import type { ToolbarContext } from "./toolbar/toolbar.svelte.ts";

export function getAppContext(): AppContext | null {
    let context = getContext("whiteboard-context") as AppContext;
    return context;
}

export function getContainerContext(): ContainerContext | null {
    let context = getContext("container-context") as ContainerContext;
    return context;
}

export function setContainerContext(context: ContainerContext) {
    setContext("container-context", context);
}

export function getViewPortContext() {
    let context = getContext("viewport-context") as ViewportContext;
    return context;
}


export function getToolbarContext() {
    let context = getContext("toolbar-context") as ToolbarContext;
    return context;
}