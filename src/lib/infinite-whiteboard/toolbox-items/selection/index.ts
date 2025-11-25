import type { ToolboxItem } from "@lib/infinite-whiteboard/types";
import SelectionEditor from "./selection-editor.svelte"
import { handle } from "./handler.svelte";
import { MousePointer2 } from "@lucide/svelte";

const SelectionToolboxItem: ToolboxItem = {
   editorComponent: SelectionEditor,
   manifest: {
      name: "selection",
      displayName: "Selection",
      icon: MousePointer2
   },
   handler: handle
}

export default SelectionToolboxItem;