import type { ToolboxItem } from "@lib/infinite-whiteboard/types";
import RectEditor from "./rect-editor.svelte"
import { handle } from "./handler.svelte";
import { Square } from "@lucide/svelte";

const RectToolboxItem: ToolboxItem = {
   editorComponent: RectEditor,
   manifest: {
      name: "rect",
      displayName: "Rect",
      icon: Square
   },
   handler: handle
}

export default RectToolboxItem;