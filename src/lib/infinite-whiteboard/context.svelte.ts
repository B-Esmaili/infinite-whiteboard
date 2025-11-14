import { getContext } from "svelte";
import type { AppContext } from "./types.ts";


export function getAppContext(): AppContext | null {
    let context = $derived.by(()=>getContext("whiteboard-context") as AppContext);
    return context;
}