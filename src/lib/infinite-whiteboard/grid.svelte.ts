import { Container, Graphics, Point, type ColorSource } from "pixi.js";
import { extract, Throttled, watch, type MaybeGetter } from "runed";
import { getAppContext, getContainerContext, getViewPortContext } from "./context.svelte";
import type { MovedEvent } from "pixi-viewport/dist/types";

export interface GridOptions {
    size: number;
    lineColor? : ColorSource;
}

export class Grid {
    #worldPoseInstant = $state({ x: 0, y: 0 });
    #scaleInstant = $state({ x: 1, y: 1 });
    #worldPos = new Throttled(() => this.#worldPoseInstant, 200);
    #scale = new Throttled(() => this.#scaleInstant, 200);
    #options: GridOptions;
    #grids = new Map<string, Graphics>();
    #layer = new Container();

    constructor(_options: MaybeGetter<GridOptions>) {
        this.#options = extract(_options);

        watch(() => this.#worldPos.current, this.redrawGrid.bind(this));
        watch(() => this.#scale.current, this.redrawGrid.bind(this));

        let viewportContext = getViewPortContext();

        $effect(() => {

            this.redrawGrid.bind(this)();

            if (!viewportContext?.viewort) {
                return;
            }

            const self = this;

            function moveHandler(vp: MovedEvent) {
                self.#worldPoseInstant = {
                    x: vp.viewport.x,
                    y: vp.viewport.y
                };
            }

            if (viewportContext) {
                viewportContext.viewort.addChildAt(self.#layer, 0);

                viewportContext.viewort.on('move', () => console.log('move'));
                viewportContext.viewort.on('moved', moveHandler);
                viewportContext.viewort.on('zoomed', (e) => {
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
                if (viewportContext) {
                    viewportContext.viewort.removeChild(self.#layer);
                    viewportContext.viewort.off('moved', moveHandler);
                }
            };
        });
    }

    redrawGrid() {
        const GRID_SIZE = this.#options.size;
        let viewportContext = getViewPortContext();
        let containerContext = getContainerContext();
        let appContext = getAppContext();

        const lineColor = this.#options.lineColor ?? "#222";

        if (!viewportContext?.viewort || !containerContext?.container || !appContext?.app) {
            return;
        }

        const worldLeftTop = viewportContext.viewort.toWorld(new Point(0, 0));
        const worldLeftBottom = viewportContext.viewort.toWorld(
            new Point(0, viewportContext.viewort.screenHeight)
        );
        const worldRightTop = viewportContext.viewort.toWorld(
            new Point(viewportContext.viewort.screenWidth, 0)
        );
        const worldRightBottom = viewportContext.viewort.toWorld(
            new Point(0, viewportContext.viewort.screenHeight)
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