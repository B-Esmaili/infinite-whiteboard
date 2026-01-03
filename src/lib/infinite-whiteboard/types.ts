import type { Viewport } from "pixi-viewport";
import { Application, Bounds, Container, Graphics, Point, Transform, type StrokeInput } from "pixi.js";
import type { Component } from "svelte";


export interface AppContext {
    app: Application;
    element: HTMLCanvasElement;
    activeTool?: ToolboxItem;
    toolboxItems: ToolboxItem[];
    //addWidget(widget: WidgetModel): void;
    //registerElement(gr: Omit<WhiteboardElement, 'uid'>): void;
    //unregisterElement(gr: WhiteboardElement): void;
    getElementsInRange(bounds: Bounds): WhiteboardElement[];
    setSelectedElements(elements: WhiteboardElement[]): void;
    getSelectedElements(): WhiteboardElement[];
    addElement: (element: Omit<WhiteboardElement, 'uid' | 'register' | 'unRegister' | 'graphics' | 'transform' | 'updateViewModel'>) => WhiteboardElement;
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

type ViewModelType = Record<PropertyKey, unknown> | object;

export type DragDropAdapter<TViewModel extends ViewModelType> = (element: WhiteboardElement<TViewModel>, offset: Point) => TViewModel;
export type DraggableOptions<TViewModel extends ViewModelType = Record<PropertyKey, unknown>> = {
    onStart?: () => void;
    onEnd?: (offset: Point) => void;
    onMove?: (offset: Point) => void;
    adapter: DragDropAdapter<TViewModel>;
}

export interface ElementRegisterOptions<TViewModel extends ViewModelType> {
    selectable: boolean;
    draggable: false | DraggableOptions<TViewModel>
};

export interface WhiteboardElement<TModel extends ViewModelType = Record<PropertyKey, unknown>, TEditorModel extends Record<PropertyKey, unknown> | object = Record<PropertyKey, unknown>> {
    uid: string;
    name: string;
    graphics: Graphics;
    view: Component<any>;
    viewModel: TModel;
    editor: Component<any>,
    editorModel?: TEditorModel,
    register: (el: WhiteboardElement<TModel>, options: ElementRegisterOptions<TModel>) => void;
    unRegister: (el: WhiteboardElement<TModel>) => void;
    transform: Transform;
    updateViewModel: (payload: Partial<TModel>) => void;
}