import type { AppContext, ViewportContext } from "../types";
import { AbstractCommand, type CanvasObject, type ICommand } from "./ICommand"

export class AddObjectCommand extends AbstractCommand {    
    constructor(obj : CanvasObject,context : ViewportContext) {
        super(context);
    }

    execute () {
        const viewport = super.ensureContext();
        viewport.addChild();
    }

    undo () {
        super.ensureContext();
    }
}