import { getContext, setContext } from "svelte";
import type { AppContext, ContainerContext } from "./types.ts";


export function getAppContext(): AppContext | null {
    let context = $derived.by(() => getContext("whiteboard-context") as AppContext);
    return context;
}

export function getContainerContext(): ContainerContext | null {
    let context = $derived.by(() => getContext("container-context") as ContainerContext);
    return context;
}

export function setContainerContext(context: ContainerContext) {
    setContext("container-context", context);
}