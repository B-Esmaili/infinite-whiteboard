import type { MaybeUnwrap } from "./types.ts";


export function unwrapValue<T>(value: MaybeUnwrap<T>) {
    if (typeof (value) === "function") {
        return (value as () => T)();
    }

    return value;
}