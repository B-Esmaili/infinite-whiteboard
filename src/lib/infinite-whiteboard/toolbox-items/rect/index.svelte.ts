import type { ToolboxItem } from "@lib/infinite-whiteboard/types";
import { handle } from "./handler.svelte";
import { Square } from "@lucide/svelte";

const RectToolboxItem: ToolboxItem = {
   manifest: {
      name: "rect",
      displayName: "Rect",
      icon: Square
   },
   handler: handle
}

export default RectToolboxItem;