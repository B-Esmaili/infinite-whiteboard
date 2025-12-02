import type { Application, Graphics } from "pixi.js";
import type { AppContext, ViewportContext } from "../types";
import type { Viewport } from "pixi-viewport";

export type CanvasObject = Graphics

export interface ICommand {
    execute: () => void;
    undo: () => void;
}


export class AbstractCommand implements ICommand {
    constructor(protected context: ViewportContext) {

    }
    protected ensureContext() : Viewport {
        const app = this.context?.viewport;
        if (!app) {
            throw new Error("Context is not available");
        }
        return app;
    }
    execute() { };
    undo() { };
}