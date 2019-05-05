declare namespace android {
  export namespace support {
    export namespace customtabs {
      export class CustomTabsIntent {
        launchUrl(context: android.content.Context, url: android.net.Uri): void;
        intent: android.content.Intent;
        static NO_TITLE: number;
        static EXTRA_TITLE_VISIBILITY_STATE: string;
        startAnimationBundle: android.os.Bundle;
      }
      namespace CustomTabsIntent {
        export class Builder {
          constructor();
          build(): android.support.customtabs.CustomTabsIntent;
          setShowTitle(showTitle: boolean): this;
          setToolbarColor(color: number): this;
          setSecondaryToolbarColor(color: number): this;
          addDefaultShareMenuItem(): this;
          enableUrlBarHiding(): this;
          setStartAnimations(context: android.content.Context, enterResId: number, exitResId: number);
          setExitAnimations(context: android.content.Context, enterResId: number, exitResId: number);
        }
      }
    }
  }
}