import type { ToolboxItem } from "@lib/infinite-whiteboard/types";
import { handle } from "./handler.svelte";
import { Square } from "@lucide/svelte";
import RectEditor from "@lib/infinite-whiteboard/editors/rect-editor.svelte";

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