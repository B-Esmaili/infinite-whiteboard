import type { ViewportContext } from "../types";
import type { UndoRedoCommand } from "./undo-redo-command";



export class CommandManager {

    #undoStack: UndoRedoCommand[] = [];
    #redoStack: UndoRedoCommand[] = [];

    private handleKeypress(e: KeyboardEvent) {
        if (e.ctrlKey && e.code === "KeyZ") {
            this.undoLastCommand();
        }

        if (e.ctrlKey && e.code === "KeyY") {
            this.redoLastCommand();
        }
    }

    addCommand(cmd: UndoRedoCommand) {
        this.#undoStack.push(cmd);
        this.#redoStack = [];
    }

    undoLastCommand() {

        if (!this.#undoStack.length) {
            return;
        }

        const lastCommand = this.#undoStack.at(this.#undoStack.length - 1);
        if (lastCommand) {
            try {
                lastCommand.undo();
                const command = this.#undoStack.pop()!;
                this.#redoStack.push(command);
            } catch (err) {

            }
        }
    }

    redoLastCommand() {
        if (!this.#redoStack.length) {
            return;
        }

        const lastCommand = this.#redoStack.at(this.#redoStack.length - 1);
        if (lastCommand) {
            try {
                lastCommand.redo();
                const command = this.#redoStack.pop()!;
                this.#undoStack.push(command);
            } catch (err) {

            }
        }
    }

    constructor(private viewportContext: ViewportContext) {
        $effect(() => {
            window.addEventListener("keypress", this.handleKeypress.bind(this));

            return () => {
                window.removeEventListener("keypress", this.handleKeypress);
            }
        })
    }
}