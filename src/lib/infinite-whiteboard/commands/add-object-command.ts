import type { ViewportContext, WhiteboardElement } from "../types";
import { UndoRedoCommand } from "./undo-redo-command";

export class AddElementUndoCommand extends UndoRedoCommand {
    constructor(undoCmd: () => void, redoCmd: () => void, private el: WhiteboardElement) {
        super(undoCmd, redoCmd);
    }

    getElement() {
        return this.el;
    }

    setElement(el: WhiteboardElement) {
        this.el = el;
    }
}