declare namespace android {
  export namespace support {
    export namespace customtabs {
      export class CustomTabsClient {
        static getPackageName(context: android.content.Context, list: java.util.List): string;
      }
      export class CustomTabsIntent {
        launchUrl(context: android.content.Context, url: android.net.Uri): void;
        intent: android.content.Intent;
        static NO_TITLE: number;
        static EXTRA_TITLE_VISIBILITY_STATE: string;
        static EXTRA_ENABLE_URLBAR_HIDING: string;
        startAnimationBundle: android.os.Bundle;
      }
      namespace CustomTabsIntent {
        export class Builder {
          constructor();
          build(): android.support.customtabs.CustomTabsIntent;
          setShowTitle(showTitle: boolean): this;
          setToolbarColor(color: number): this;
          setSecondaryToolbarColor(color: number): this;
          setNavigationBarColor(color: number): this;
          setNavigationBarDividerColor(color: number): this;
          addDefaultShareMenuItem(): this;
          enableUrlBarHiding(): this;
          setStartAnimations(context: android.content.Context, enterResId: number, exitResId: number): this;
          setExitAnimations(context: android.content.Context, enterResId: number, exitResId: number): this;
          setCloseButtonIcon(icon: android.graphics.Bitmap): this;
        }
      }
    }
  }
}

declare namespace androidx {
  export namespace browser {
    export namespace customtabs {
      export class CustomTabsClient {
        static getPackageName(context: android.content.Context, list: java.util.List): string;
      }
      export class CustomTabsIntent {
        launchUrl(context: android.content.Context, url: android.net.Uri): void;
        intent: android.content.Intent;
        static NO_TITLE: number;
        static EXTRA_TITLE_VISIBILITY_STATE: string;
        static EXTRA_ENABLE_URLBAR_HIDING: string;
        startAnimationBundle: android.os.Bundle;
      }
      namespace CustomTabsIntent {
        export class Builder {
          constructor();
          build(): android.support.customtabs.CustomTabsIntent;
          setShowTitle(showTitle: boolean): this;
          setToolbarColor(color: number): this;
          setSecondaryToolbarColor(color: number): this;
          setNavigationBarColor(color: number): this;
          setNavigationBarDividerColor(color: number): this;
          addDefaultShareMenuItem(): this;
          enableUrlBarHiding(): this;
          setStartAnimations(context: android.content.Context, enterResId: number, exitResId: number): this;
          setExitAnimations(context: android.content.Context, enterResId: number, exitResId: number): this;
          setCloseButtonIcon(icon: android.graphics.Bitmap): this;
        }
      }
    }
  }
}