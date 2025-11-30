import type { Viewport } from "pixi-viewport";
import { Application, Container, type StrokeInput } from "pixi.js";
import type { Component } from "svelte";

export interface AppContext {
    app: Application;
    element: HTMLCanvasElement;
    activeTool?: ToolboxItem;
    toolboxItems: ToolboxItem[];
    addWidget(widget: WidgetModel): void;
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

//export interface ToolboxItem<TEditorProps extends Record<string, unknown> = {}> {
export interface ToolboxItem {
    editorComponent: Component<any>;
    handler: ToolboxItemHandler;
    manifest: ToolboxItemManifest;
}

export interface WidgetModel {
    name: string,
    editor: Component<any>;
    editorModel?: Record<PropertyKey, unknown>;
    widget: Component<any>;
    widgetModel?: Record<PropertyKey, unknown>;
    mounted: boolean;
}

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