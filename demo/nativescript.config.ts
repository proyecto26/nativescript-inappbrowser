import { NativeScriptConfig } from "@nativescript/core";

export default {
    id: "org.nativescript.demo",
    appPath: "app",
    android: {
        v8Flags: "--expose_gc",
        markingMode: "none",
    },
} as NativeScriptConfig;
