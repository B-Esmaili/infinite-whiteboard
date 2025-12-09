import type { ViewportContext } from "../types";
import type { Viewport } from "pixi-viewport";

export class UndoRedoCommand {

    constructor(protected undoCmd: () => void,protected redoCmd: () => void  /*private context: ViewportContext*/) {

    }

    protected ensureContext() {
        //const app = this.context?.viewport;

        //if (!app) {
        //    throw new Error("Context is not available");
        //}

        //return app;
    }

    undo() {
        this.undoCmd();
    }

    redo(){
        this.redoCmd();
    }
}