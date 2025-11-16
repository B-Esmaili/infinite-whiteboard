import type { Viewport } from "pixi-viewport";
import { Application, Container } from "pixi.js";

export interface AppContext {
    app: Application;

}

export interface ContainerContext {
    container: Container;
}

export interface ViewportContext {
    viewort: Viewport
}
