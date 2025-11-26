import { Container, Graphics, Point, type ColorSource } from "pixi.js";
import { extract, Throttled, watch, type MaybeGetter } from "runed";
import { getAppContext, getContainerContext, getViewPortContext } from "./context.svelte";
import type { MovedEvent } from "pixi-viewport/dist/types";
import { browser } from "$app/environment";
import type { AppContext, ContainerContext, ViewportContext } from "./types";

export interface GridOptions {
    size: number;
    lineColor?: ColorSource;
}

export class Grid {
    #worldPoseInstant = $state({ x: 0, y: 0 });
    #scaleInstant = $state({ x: 1, y: 1 });
    #worldPos = new Throttled(() => this.#worldPoseInstant, 200);
    #scale = new Throttled(() => this.#scaleInstant, 200);
    #options: GridOptions;
    #grids = new Map<string, Graphics>();
    #layer = new Container();
    #viewportContext : ViewportContext;
    #containerContext : ContainerContext;
    #appContext : AppContext;

    constructor(_options: MaybeGetter<GridOptions>) {
        this.#options = extract(_options);
        const _this = this;

        watch(() => this.#worldPos.current, this.redrawGrid.bind(this));
        watch(() => this.#scale.current, this.redrawGrid.bind(this));


        function handleResize(){
            _this.redrawGrid.bind(_this)();
        }

        if (browser) {
            window.addEventListener("resize", handleResize);
        }

        this.#viewportContext = getViewPortContext();
        this.#containerContext = getContainerContext()!;
        this.#appContext = getAppContext()!;

        $effect(() => {

            this.redrawGrid.bind(this)();

            if (!this.#viewportContext?.viewort) {
                return;
            }

            const self = this;

            function moveHandler(vp: MovedEvent) {
                self.#worldPoseInstant = {
                    x: vp.viewport.x,
                    y: vp.viewport.y
                };
            }

            if (this.#viewportContext) {
                this.#viewportContext.viewort.addChildAt(self.#layer, 0);

                this.#viewportContext.viewort.on('moved', moveHandler);
                this.#viewportContext.viewort.on('zoomed', (e) => {
                    self.#scaleInstant = {
                        x: e.viewport.scale.x,
                        y: e.viewport.scale.y
                    };
                });
            }

            const g = new Graphics();

            g.stroke(0xff0000);
            g.setStrokeStyle({
                width: 5
            });
            g.fill({
                color: 0xf59854,
                alpha: 0.5
            });
            g.roundRect(100, 100, 200, 200);
            g.fill();
            g.stroke();

            return () => {
                if (this.#viewportContext) {
                    this.#viewportContext.viewort.removeChild(self.#layer);
                    this.#viewportContext.viewort.off('moved', moveHandler);
                    if (browser) {
                        window.removeEventListener("resize", handleResize);
                    }
                }
            };
        });
    }

    redrawGrid() {
        const GRID_SIZE = this.#options.size;        

        const lineColor = this.#options.lineColor ?? "#222";

        if (!this.#viewportContext?.viewort || !this.#containerContext?.container || !this.#appContext?.app) {
            return;
        }

        const worldLeftTop = this.#viewportContext.viewort.toWorld(new Point(0, 0));
        const worldLeftBottom = this.#viewportContext.viewort.toWorld(
            new Point(0, this.#viewportContext.viewort.screenHeight)
        );
        const worldRightTop = this.#viewportContext.viewort.toWorld(
            new Point(this.#viewportContext.viewort.screenWidth, 0)
        );
        const worldRightBottom = this.#viewportContext.viewort.toWorld(
            new Point(0, this.#viewportContext.viewort.screenHeight)
        );

        const gridRemSpaceX = worldLeftTop.x % GRID_SIZE;
        const gridRemSpaceY = worldLeftTop.y % GRID_SIZE;

        const startX = worldLeftTop.x - gridRemSpaceX;
        const endX = worldRightTop.x;
        const startY = worldLeftTop.y - gridRemSpaceY;
        const endY = worldRightBottom.y;

        let lastX = 0;

        for (let i = startX; i < endX; i += GRID_SIZE) {
            lastX = i;
            const key = `V-${i}`;

            const existingLine = this.#grids.get(key);

            const x1 = i,
                y1 = worldLeftTop.y,
                x2 = i,
                y2 = worldLeftBottom.y;

            if (existingLine) {
                existingLine.clear();
            }

            const Line = existingLine ?? new Graphics();

            Line.stroke({
                color: lineColor,
                width: 1
            });

            Line.moveTo(x1, y1);
            Line.lineTo(x2, y2);

            Line.stroke();

            if (!existingLine) {
                this.#grids.set(key, Line);
                this.#layer.addChild(Line);
            }
        }

        //Cleanup out of viewport vertical lines

        let curX = lastX;

        while (true) {
            curX += GRID_SIZE;
            const key = `V-${curX}`;
            const exists = this.#grids.has(key);
            if (!exists) {
                break;
            } else {
                this.#layer.removeChild(this.#grids.get(key)!);
                this.#grids.delete(key);
            }
        }

        curX = startX;

        while (true) {
            curX -= GRID_SIZE;
            const key = `V-${curX}`;
            const exists = this.#grids.has(key);
            if (!exists) {
                break;
            } else {
                this.#layer.removeChild(this.#grids.get(key)!);
                this.#grids.delete(key);
            }
        }

        let lastY = 0;

        for (let i = startY; i < endY; i += GRID_SIZE) {
            lastY = i;
            const key = `H-${i}`;

            const existingLine = this.#grids.get(key);

            const x1 = worldLeftTop.x,
                y1 = i,
                x2 = worldRightTop.x,
                y2 = i;

            if (existingLine) {
                existingLine.clear();
            }

            const Line = existingLine ?? new Graphics();

            Line.stroke({
                color: lineColor,
                width: 1
            });

            Line.moveTo(x1, y1);
            Line.lineTo(x2, y2);

            Line.stroke();

            if (!existingLine) {
                this.#grids.set(key, Line);
                this.#layer.addChild(Line);
            }
        }

        //Cleanup out of viewport horizontal lines

        let curY = lastY;

        while (true) {
            curY += GRID_SIZE;
            const key = `H-${curY}`;
            const exists = this.#grids.has(key);
            if (!exists) {
                break;
            } else {
                this.#layer.removeChild(this.#grids.get(key)!);
                this.#grids.delete(key);
            }
        }

        curY = startY;

        while (true) {
            curY -= GRID_SIZE;
            const key = `H-${curY}`;
            const exists = this.#grids.has(key);
            if (!exists) {
                break;
            } else {
                this.#layer.removeChild(this.#grids.get(key)!);
                this.#grids.delete(key);
            }
        }
    }
}