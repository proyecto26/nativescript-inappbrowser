import { Color } from "@nativescript/core";

export function parseColor(color: string | Color) {
  if (color && !(color instanceof Color)) {
     return new Color(color);
  }
  return color as Color;
}

export function tryParseColor(colorString: string | Color, errorMessage: string) {
  try {
    return parseColor(colorString);
  } catch (error) {
    throw new Error(`${errorMessage} ${colorString}: ${error.message}`);
  }
}

export function log(message: string, ...optionalParams: any[]): void {
  const nglog = (<any>global).__nslog;
  if (nglog) {
    nglog(message, ...optionalParams);
  }
  console.log(message, ...optionalParams);
}
