declare namespace android {
  export namespace support {
    export namespace customtabs {
      export class CustomTabsCallback extends java.lang.Object {}
      export class CustomTabsSession extends java.lang.Object {
        mayLaunchUrl(
          url: android.net.Uri,
          extras: android.os.Bundle,
          otherLikelyBundles: java.util.List<android.os.Bundle>
        ): boolean;
      }
      export class CustomTabsClient extends java.lang.Object {
        static getPackageName(
          context: android.content.Context,
          list: java.util.List
        ): string;
        static bindCustomTabsService(
          context: android.content.Context,
          packageName: string,
          connection: CustomTabsServiceConnection
        ): CustomTabsClient;
        warmup(flags: java.lang.Long): boolean;
        newSession(callback: CustomTabsCallback): CustomTabsSession;
      }
      export class CustomTabsIntent extends java.lang.Object {
        launchUrl(context: android.content.Context, url: android.net.Uri): void;
        intent: android.content.Intent;
        static NO_TITLE: number;
        static EXTRA_TITLE_VISIBILITY_STATE: string;
        static EXTRA_ENABLE_URLBAR_HIDING: string;
        startAnimationBundle: android.os.Bundle;
      }
      namespace CustomTabsIntent {
        export class Builder extends java.lang.Object {
          build(): CustomTabsIntent;
          setShowTitle(showTitle: boolean): this;
          setToolbarColor(color: number): this;
          setSecondaryToolbarColor(color: number): this;
          setNavigationBarColor(color: number): this;
          setNavigationBarDividerColor(color: number): this;
          addDefaultShareMenuItem(): this;
          enableUrlBarHiding(): this;
          setStartAnimations(
            context: android.content.Context,
            enterResId: number,
            exitResId: number
          ): this;
          setExitAnimations(
            context: android.content.Context,
            enterResId: number,
            exitResId: number
          ): this;
          setCloseButtonIcon(icon: android.graphics.Bitmap): this;
        }
      }
      export class CustomTabsService extends android.app.Service {
        static KEY_URL: string;
      }
      export class CustomTabsServiceConnection extends android.content
        .ServiceConnection {
        onCustomTabsServiceConnected(
          name: android.content.ComponentName,
          client: CustomTabsClient
        ): void;
      }
    }
  }
}

declare namespace androidx {
  export namespace browser {
    export namespace customtabs {
      export class CustomTabsCallback extends java.lang.Object {}
      export class CustomTabsSession extends java.lang.Object {
        mayLaunchUrl(
          url: android.net.Uri,
          extras: android.os.Bundle,
          otherLikelyBundles: java.util.List<android.os.Bundle>
        ): boolean;
      }
      export class CustomTabsClient extends java.lang.Object {
        static getPackageName(
          context: android.content.Context,
          list: java.util.List
        ): string;
        static bindCustomTabsService(
          context: android.content.Context,
          packageName: string,
          connection: CustomTabsServiceConnection
        ): void;
        warmup(flags: java.lang.Long): boolean;
        newSession(callback: CustomTabsCallback): CustomTabsSession;
      }
      export class CustomTabsIntent extends java.lang.Object {
        launchUrl(context: android.content.Context, url: android.net.Uri): void;
        intent: android.content.Intent;
        static NO_TITLE: number;
        static EXTRA_TITLE_VISIBILITY_STATE: string;
        static EXTRA_ENABLE_URLBAR_HIDING: string;
        startAnimationBundle: android.os.Bundle;
      }
      namespace CustomTabsIntent {
        export class Builder extends java.lang.Object {
          build(): CustomTabsIntent;
          setShowTitle(showTitle: boolean): this;
          setToolbarColor(color: number): this;
          setSecondaryToolbarColor(color: number): this;
          setNavigationBarColor(color: number): this;
          setNavigationBarDividerColor(color: number): this;
          addDefaultShareMenuItem(): this;
          enableUrlBarHiding(): this;
          setStartAnimations(
            context: android.content.Context,
            enterResId: number,
            exitResId: number
          ): this;
          setExitAnimations(
            context: android.content.Context,
            enterResId: number,
            exitResId: number
          ): this;
          setCloseButtonIcon(icon: android.graphics.Bitmap): this;
        }
      }
      export class CustomTabsService extends android.app.Service {
        static KEY_URL: string;
      }
      export class CustomTabsServiceConnection extends android.content
        .ServiceConnection {
        onCustomTabsServiceConnected(
          name: android.content.ComponentName,
          client: CustomTabsClient
        ): void;
      }
    }
  }
}
