import type { Viewport } from "pixi-viewport";
import { Application, Container } from "pixi.js";
import type { Component } from "svelte";

export interface AppContext {
    app: Application;
    element: HTMLCanvasElement;
    activeTool? : ToolboxItem;
    toolboxItems : ToolboxItem[]; 
}

export interface ContainerContext {
    container: Container;
}

export interface ViewportContext {
    viewort: Viewport
}

type ToolboxItemHandler = () => void;

interface ToolboxItemManifest {
    name: string;
    displayName: string;
    icon: Component;
    parent?: string;
}

export interface ToolboxItem<TEditorProps extends Record<string, unknown> = {}> {
    editorComponent: Component<TEditorProps>;
    handler: ToolboxItemHandler;
    manifest: ToolboxItemManifest;
}