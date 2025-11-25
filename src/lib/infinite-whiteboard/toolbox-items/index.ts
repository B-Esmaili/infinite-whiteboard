import type { ToolboxItem } from "../types"
import Selection from "./selection";
import Pan from "./pan";
import Rect from "./rect/index.svelte";

const items: ToolboxItem[] = [
    Selection,
    Pan,
    Rect
]

export default items