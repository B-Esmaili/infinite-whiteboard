import { getAppContext } from "@lib/infinite-whiteboard/context.svelte"

export function handle(){
    const appContext = getAppContext();
    let tool = $derived(appContext?.activeTool);

    $inspect(tool)
}