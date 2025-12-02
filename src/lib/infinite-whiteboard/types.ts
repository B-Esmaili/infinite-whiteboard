import type { Viewport } from "pixi-viewport";
import { Application, Bounds, Container, Graphics, type StrokeInput } from "pixi.js";
import type { Component } from "svelte";


export interface AppContext {
    app: Application;
    element: HTMLCanvasElement;
    activeTool?: ToolboxItem;
    toolboxItems: ToolboxItem[];
    //addWidget(widget: WidgetModel): void;
    //registerElement(gr: Omit<WhiteboardElement, 'uid'>): void;
    //unregisterElement(gr: WhiteboardElement): void;
    getSelectedElements(bounds: Bounds): WhiteboardElement[];
    addElement: (element: Omit<WhiteboardElement, 'uid' | 'register' | 'unRegister' | 'graphics'>) => WhiteboardElement;
    removeElement: (element: string) => void;
}

export interface ContainerContext {
    container: Container;
}

export interface ViewportContext {
    viewport: Viewport
}

type ToolboxItemHandler = () => void;

interface ToolboxItemManifest {
    name: string;
    displayName: string;
    icon: Component;
    parent?: string;
}

export interface ToolboxItem {
    handler: ToolboxItemHandler;
    manifest: ToolboxItemManifest;
}

// export interface WidgetModel {
//     name: string,
//     editor: Component<any>;
//     editorModel?: Record<PropertyKey, unknown>;
//     widget: Component<any>;
//     widgetModel?: Record<PropertyKey, unknown>;
//     mounted: boolean;
// }

export type StrokeStyle = "solid" | "dashed" | "doted";

export type WidgetStrokeEditorModel = {
    width: string;
    style: StrokeStyle;
    color: string;
    opacity: Number;
}

export type WidgetBackgroundEditorModel = {
    color: string;
}

export type WidgetEditorModel = {
    stroke: WidgetStrokeEditorModel;
    background: WidgetBackgroundEditorModel;
    index: Number;
}

export interface ElementRegisterOptions {
    selectable: boolean;
};

export interface WhiteboardElement<TModel extends Record<PropertyKey, unknown> | object = Record<PropertyKey, unknown>, TEditorModel extends Record<PropertyKey, unknown> | object = Record<PropertyKey, unknown>> {
    uid: string;
    name: string;
    graphics: Graphics;
    view: Component<any>;
    viewModel: TModel;
    editor: Component<any>,
    editorModel?: TEditorModel,
    register: (el: WhiteboardElement<TModel>, options: ElementRegisterOptions) => void;
    unRegister: (el: WhiteboardElement<TModel>) => void;
}