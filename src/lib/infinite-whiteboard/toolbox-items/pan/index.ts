import type { ToolboxItem } from "@lib/infinite-whiteboard/types";
import PanEditor from "./pan-editor.svelte"
import { handle } from "./handler.svelte";
import { Hand } from "@lucide/svelte";

const PanToolboxItem: ToolboxItem = {
   editorComponent: PanEditor,
   manifest: {
      name: "pan",
      displayName: "Pan",
      icon: Hand
   },
   handler: handle
}

export default PanToolboxItem;