import { Color } from "@nativescript/core";

export function parseColor(color: string | Color) {
    if (color && !(color instanceof Color)) {
        return new Color(color);
    }
    return color as Color;
}