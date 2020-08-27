import Uri = android.net.Uri;
import Bundle = android.os.Bundle;
import Intent = android.content.Intent;
import Context = android.content.Context;
import Browser = android.provider.Browser;
import Pattern = java.util.regex.Pattern;
import AssertionError = java.lang.AssertionError;

import { Color, Utils, Application, EventData } from '@nativescript/core';
import {
  ChromeTabsEvent,
  BROWSER_ACTIVITY_EVENTS,
  createStartIntent,
  createDismissIntent
} from './ChromeTabsManagerActivity';

import {
  BrowserResult,
  AuthSessionResult,
  getDefaultOptions
} from './InAppBrowser.common';

import {
  openAuthSessionPolyfillAsync,
  closeAuthSessionPolyfillAsync
} from './utils.android';

declare let global: any;

type Builder = androidx.browser.customtabs.CustomTabsIntent.Builder;
const CustomTabsIntent = (useAndroidX() ? androidx.browser : android.support).customtabs.CustomTabsIntent;
function useAndroidX() {
  return global.androidx && global.androidx.browser;
}

type Animations = {
  startEnter: string,
  startExit: string,
  endEnter: string,
  endExit: string
};

type InAppBrowserOptions = {
  showTitle?: boolean,
  toolbarColor?: string,
  secondaryToolbarColor?: string,
  enableUrlBarHiding?: boolean,
  enableDefaultShare?: boolean,
  forceCloseOnRedirection?: boolean,
  animations?: Animations,
  headers?: { [key: string]: string }
};

class InAppBrowserModule extends java.lang.Object {
  private static ERROR_CODE = "InAppBrowser";
  private static KEY_TOOLBAR_COLOR = "toolbarColor";
  private static KEY_SECONDARY_TOOLBAR_COLOR = "secondaryToolbarColor";
  private static KEY_ENABLE_URL_BAR_HIDING = "enableUrlBarHiding";
  private static KEY_SHOW_PAGE_TITLE = "showTitle";
  private static KEY_DEFAULT_SHARE_MENU_ITEM = "enableDefaultShare";
  private static KEY_FORCE_CLOSE_ON_REDIRECTION = "forceCloseOnRedirection";
  private static KEY_ANIMATIONS = "animations";
  private static KEY_HEADERS = "headers";
  private static KEY_ANIMATION_START_ENTER = "startEnter";
  private static KEY_ANIMATION_START_EXIT = "startExit";
  private static KEY_ANIMATION_END_ENTER = "endEnter";
  private static KEY_ANIMATION_END_EXIT = "endExit";

  private static redirectResolve: any;
  private static redirectReject: any;
  private currentActivity: any;
  private animationIdentifierPattern = Pattern.compile("^.+:.+/");

  constructor() {
    super();
    return global.__native(this);
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  open(
    url: string,
    options: InAppBrowserOptions = {}
  ): Promise<BrowserResult> {
    const mOpenBrowserPromise = InAppBrowserModule.redirectResolve;
    if (mOpenBrowserPromise) {
      this.flowDidFinish();
      const result: BrowserResult = {
        type: 'cancel'
      };
      return Promise.resolve(result);
    }

    this.currentActivity = Application.android.foregroundActivity || Application.android.startActivity;
    if (!this.currentActivity) {
      return Promise.reject(new Error(InAppBrowserModule.ERROR_CODE));
    }

    const inAppBrowserOptions: InAppBrowserOptions = getDefaultOptions(url, options);

    const builder = new CustomTabsIntent.Builder();
    if (inAppBrowserOptions[InAppBrowserModule.KEY_TOOLBAR_COLOR]) {
      const colorString = inAppBrowserOptions[InAppBrowserModule.KEY_TOOLBAR_COLOR];
      try {
        builder.setToolbarColor(new Color(colorString).android);
      } catch (error) {
        throw new Error(
                "Invalid toolbar color '" + colorString + "': " + error.message);
      }
    }
    if (inAppBrowserOptions[InAppBrowserModule.KEY_SECONDARY_TOOLBAR_COLOR]) {
      const colorString = inAppBrowserOptions[InAppBrowserModule.KEY_SECONDARY_TOOLBAR_COLOR];
      try {
        builder.setSecondaryToolbarColor(new Color(colorString).android);
      } catch (error) {
        throw new Error(
                "Invalid secondary toolbar color '" + colorString + "': " + error.message);
      }
    }
    if (inAppBrowserOptions[InAppBrowserModule.KEY_ENABLE_URL_BAR_HIDING]) {
      builder.enableUrlBarHiding();
    }
    if (inAppBrowserOptions[InAppBrowserModule.KEY_DEFAULT_SHARE_MENU_ITEM]) {
      builder.addDefaultShareMenuItem();
    }
    const context = Utils.android.getApplicationContext();
    if (inAppBrowserOptions[InAppBrowserModule.KEY_ANIMATIONS]) {
      const animations = inAppBrowserOptions[InAppBrowserModule.KEY_ANIMATIONS];
      this.applyAnimation(context, builder, animations);
    }

    const customTabsIntent = builder.build();

    const keyHeaders = inAppBrowserOptions[InAppBrowserModule.KEY_HEADERS];
    if (keyHeaders) {
      const headers = new Bundle();
      for (const key in keyHeaders) {
        if (keyHeaders.hasOwnProperty(key)) {
          headers.putString(key, keyHeaders[key]);
        }
      }
      customTabsIntent.intent.putExtra(Browser.EXTRA_HEADERS, headers);
    }

    if (inAppBrowserOptions[InAppBrowserModule.KEY_FORCE_CLOSE_ON_REDIRECTION]) {
      customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
      customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
    }

    const intent = customTabsIntent.intent;
    intent.setData(Uri.parse(url));
    if (inAppBrowserOptions[InAppBrowserModule.KEY_SHOW_PAGE_TITLE]) {
      builder.setShowTitle(!!inAppBrowserOptions[InAppBrowserModule.KEY_SHOW_PAGE_TITLE]);
    }
    else {
      intent.putExtra(CustomTabsIntent.EXTRA_TITLE_VISIBILITY_STATE, CustomTabsIntent.NO_TITLE);
    }

    this.registerEvent();

    this.currentActivity.startActivity(
      createStartIntent(this.currentActivity, intent),
      customTabsIntent.startAnimationBundle
    );

    return new Promise(function (resolve, reject) {
      InAppBrowserModule.redirectResolve = resolve;
      InAppBrowserModule.redirectReject = reject;
    });
  }

  public close(): void {
    if (!InAppBrowserModule.redirectResolve) {
      return;
    }

    if (!this.currentActivity) {
      InAppBrowserModule.redirectReject(new Error(InAppBrowserModule.ERROR_CODE));
      this.flowDidFinish();
      return;
    }

    BROWSER_ACTIVITY_EVENTS.off('DismissedEvent');

    const result: BrowserResult = {
      type: 'dismiss'
    };
    InAppBrowserModule.redirectResolve(result);
    this.flowDidFinish();

    this.currentActivity.startActivity(
      createDismissIntent(this.currentActivity)
    );
  }

  async openAuth(
    url: string,
    redirectUrl: string,
    options: InAppBrowserOptions = {}
  ): Promise<AuthSessionResult> {
    const inAppBrowserOptions = getDefaultOptions(url, options);
    try {
      return await openAuthSessionPolyfillAsync(
        url, redirectUrl, inAppBrowserOptions, (startUrl, opt) => this.open(startUrl, opt)
      );
    } finally {
      closeAuthSessionPolyfillAsync();
      this.close();
    }
  }

  public closeAuth(): void {
    closeAuthSessionPolyfillAsync();
    this.close();
  }

  public onEvent(event: EventData): void {
    BROWSER_ACTIVITY_EVENTS.off('DismissedEvent');

    if (!InAppBrowserModule.redirectResolve) {
      throw new AssertionError();
    }
    const browserEvent = <ChromeTabsEvent>event.object;
    InAppBrowserModule.redirectResolve({
      type: browserEvent.resultType,
      message: browserEvent.message
    });
    this.flowDidFinish();
  }

  private registerEvent(): void {
    BROWSER_ACTIVITY_EVENTS.once('DismissedEvent', (e) => this.onEvent(e));
  }

  private resolveAnimationIdentifierIfNeeded(context: Context, identifier: string): number {
    if (this.animationIdentifierPattern.matcher(identifier).find()) {
      return context.getResources().getIdentifier(identifier, null, null);
    } else {
      return context.getResources().getIdentifier(identifier, "anim", context.getPackageName());
    }
  }

  private applyAnimation(context: Context, builder: Builder, animations: Animations): void {
    const startEnterAnimationId = animations[InAppBrowserModule.KEY_ANIMATION_START_ENTER]
      ? this.resolveAnimationIdentifierIfNeeded(context, animations[InAppBrowserModule.KEY_ANIMATION_START_ENTER])
      : -1;
    const startExitAnimationId = animations[InAppBrowserModule.KEY_ANIMATION_START_EXIT]
      ? this.resolveAnimationIdentifierIfNeeded(context, animations[InAppBrowserModule.KEY_ANIMATION_START_EXIT])
      : -1;
    const endEnterAnimationId = animations[InAppBrowserModule.KEY_ANIMATION_END_ENTER]
      ? this.resolveAnimationIdentifierIfNeeded(context, animations[InAppBrowserModule.KEY_ANIMATION_END_ENTER])
      : -1;
    const endExitAnimationId = animations[InAppBrowserModule.KEY_ANIMATION_END_EXIT]
      ? this.resolveAnimationIdentifierIfNeeded(context, animations[InAppBrowserModule.KEY_ANIMATION_END_EXIT])
      : -1;

    if (startEnterAnimationId !== -1 && startExitAnimationId !== -1) {
      builder.setStartAnimations(context, startEnterAnimationId, startExitAnimationId);
    }

    if (endEnterAnimationId !== -1 && endExitAnimationId !== -1) {
      builder.setExitAnimations(context, endEnterAnimationId, endExitAnimationId);
    }
  }

  private flowDidFinish(): void {
    InAppBrowserModule.redirectResolve = null;
    InAppBrowserModule.redirectReject = null;
  }
}

export default new InAppBrowserModule();
