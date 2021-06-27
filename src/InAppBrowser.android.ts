import Uri = android.net.Uri;
import Bundle = android.os.Bundle;
import TextUtils = android.text.TextUtils;
import Intent = android.content.Intent;
import Context = android.content.Context;
import BitmapFactory = android.graphics.BitmapFactory;
import Browser = android.provider.Browser;
import Pattern = java.util.regex.Pattern;

import { Utils, Application, EventData } from '@nativescript/core';
import {
  ChromeTabsEvent,
  BROWSER_ACTIVITY_EVENTS,
  createStartIntent,
  createDismissIntent
} from './ChromeTabsManagerActivity';
import {
  Animations,
  BrowserResult,
  getDefaultOptions,
  InAppBrowserOptions,
  InAppBrowserClassMethods,
  RedirectResolve,
  RedirectReject,
  BROWSER_TYPES,
} from './InAppBrowser.common';
import {
  Builder,
  getDrawableId,
  toolbarIsLight,
  CustomTabsIntent,
  DISMISSED_EVENT,
  ARROW_BACK_WHITE,
  ARROW_BACK_BLACK,
  getPreferredPackages,
  openAuthSessionPolyfillAsync,
  closeAuthSessionPolyfillAsync,
} from './utils.android';

import { tryParseColor } from './utils.common';

declare let global: any;

let InAppBrowserModuleInstance: InAppBrowserClassMethods;

function setup() {
  @NativeClass()
  class InAppBrowserModule extends java.lang.Object implements InAppBrowserClassMethods {
    private static ERROR_CODE = 'InAppBrowser';
    private static KEY_TOOLBAR_COLOR = 'toolbarColor';
    private static KEY_SECONDARY_TOOLBAR_COLOR = 'secondaryToolbarColor';
    private static KEY_NAVIGATION_BAR_COLOR = 'navigationBarColor';
    private static KEY_NAVIGATION_BAR_DIVIDER_COLOR = 'navigationBarDividerColor';
    private static KEY_ENABLE_URL_BAR_HIDING = 'enableUrlBarHiding';
    private static KEY_SHOW_PAGE_TITLE = 'showTitle';
    private static KEY_DEFAULT_SHARE_MENU_ITEM = 'enableDefaultShare';
    private static KEY_FORCE_CLOSE_ON_REDIRECTION = 'forceCloseOnRedirection';
    private static KEY_ANIMATIONS = 'animations';
    private static KEY_HEADERS = 'headers';
    private static KEY_ANIMATION_START_ENTER = 'startEnter';
    private static KEY_ANIMATION_START_EXIT = 'startExit';
    private static KEY_ANIMATION_END_ENTER = 'endEnter';
    private static KEY_ANIMATION_END_EXIT = 'endExit';
    private static KEY_HAS_BACK_BUTTON = 'hasBackButton';
    private static KEY_BROWSER_PACKAGE = 'browserPackage';
    private static KEY_SHOW_IN_RECENTS = 'showInRecents';
  
    private static redirectResolve: RedirectResolve;
    private static redirectReject: RedirectReject;
    private isLightTheme: boolean;
    private currentActivity: any;
    private animationIdentifierPattern = Pattern.compile('^.+:.+/');
  
    constructor() {
      super();
      return global.__native(this);
    }
  
    isAvailable() {
      const context = Utils.android.getApplicationContext();
      const resolveInfos = getPreferredPackages(context);
      return Promise.resolve(!(resolveInfos === null || resolveInfos.isEmpty()));
    }
  
    async open(
      url: string,
      options?: InAppBrowserOptions,
    ): Promise<BrowserResult> {
      const mOpenBrowserPromise = InAppBrowserModule.redirectResolve;
      if (mOpenBrowserPromise) {
        this.flowDidFinish();
        const result: BrowserResult = {
          type: BROWSER_TYPES.CANCEL
        };
        return Promise.resolve(result);
      }
  
      this.currentActivity = Application.android.foregroundActivity || Application.android.startActivity;
      if (!this.currentActivity) {
        return Promise.reject(new Error(InAppBrowserModule.ERROR_CODE));
      }
      const result = new Promise<BrowserResult>(function (resolve, reject) {
        InAppBrowserModule.redirectResolve = resolve;
        InAppBrowserModule.redirectReject = reject;
      });
  
      const inAppBrowserOptions = getDefaultOptions(url, options);
  
      const builder = new CustomTabsIntent.Builder();
      let colorString = inAppBrowserOptions[InAppBrowserModule.KEY_TOOLBAR_COLOR];
      this.isLightTheme = false;
      if (colorString) {
        const color = tryParseColor(colorString, 'Invalid toolbar color');
        if (color) {
          builder.setToolbarColor(color.android);
          this.isLightTheme = toolbarIsLight(color.android);
        }
      }
      colorString = inAppBrowserOptions[InAppBrowserModule.KEY_SECONDARY_TOOLBAR_COLOR];
      if (colorString) {
        const color = tryParseColor(colorString, 'Invalid secondary toolbar color');
        if (color) {
          builder.setSecondaryToolbarColor(color.android);
        }
      }
      colorString = inAppBrowserOptions[InAppBrowserModule.KEY_NAVIGATION_BAR_COLOR];
      if (colorString) {
        const color = tryParseColor(colorString, 'Invalid navigation bar color');
        if (color) {
          builder.setSecondaryToolbarColor(color.android);
        }
      }
      colorString = inAppBrowserOptions[InAppBrowserModule.KEY_NAVIGATION_BAR_DIVIDER_COLOR];
      if (colorString) {
        const color = tryParseColor(colorString, 'Invalid navigation bar divider color');
        if (color) {
          builder.setSecondaryToolbarColor(color.android);
        }
      }

      if (inAppBrowserOptions[InAppBrowserModule.KEY_DEFAULT_SHARE_MENU_ITEM]) {
        builder.addDefaultShareMenuItem();
      }
      const context = Utils.android.getApplicationContext() as Context;
      if (inAppBrowserOptions[InAppBrowserModule.KEY_ANIMATIONS]) {
        const animations = inAppBrowserOptions[InAppBrowserModule.KEY_ANIMATIONS];
        this.applyAnimation(context, builder, animations);
      }
      if (inAppBrowserOptions[InAppBrowserModule.KEY_HAS_BACK_BUTTON]) {
        builder.setCloseButtonIcon(BitmapFactory.decodeResource(
          context.getResources(),
          this.isLightTheme
            ? getDrawableId(ARROW_BACK_BLACK)
            : getDrawableId(ARROW_BACK_WHITE)
        ));
      }
  
      const customTabsIntent = builder.build();
      const intent = customTabsIntent.intent;
  
      const keyHeaders = inAppBrowserOptions[InAppBrowserModule.KEY_HEADERS];
      if (keyHeaders) {
        const headers = new Bundle();
        for (const key in keyHeaders) {
          if (keyHeaders.hasOwnProperty(key)) {
            headers.putString(key, keyHeaders[key]);
          }
        }
        intent.putExtra(Browser.EXTRA_HEADERS, headers);
      }
  
      if (inAppBrowserOptions[InAppBrowserModule.KEY_FORCE_CLOSE_ON_REDIRECTION]) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      }

      if (!inAppBrowserOptions[InAppBrowserModule.KEY_SHOW_IN_RECENTS]) {
        intent.addFlags(Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
      }
      
      intent.putExtra(
        CustomTabsIntent.EXTRA_ENABLE_URLBAR_HIDING,
        !!inAppBrowserOptions[InAppBrowserModule.KEY_ENABLE_URL_BAR_HIDING]
      );
      try {
        if (inAppBrowserOptions[InAppBrowserModule.KEY_BROWSER_PACKAGE] !== undefined) {
          const packageName = inAppBrowserOptions[InAppBrowserModule.KEY_BROWSER_PACKAGE];
          if (!TextUtils.isEmpty(packageName)) {
            intent.setPackage(packageName);
          }
        } else {
          const packageName = inAppBrowserOptions[InAppBrowserModule.KEY_BROWSER_PACKAGE];
          intent.setPackage(packageName);
        }
      } catch (error) {
        if (error.printStackTrace) {
          error.printStackTrace();
        }
      }

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
  
      return result;
    }
  
    public close() {
      if (!InAppBrowserModule.redirectResolve) {
        return;
      }
  
      if (!this.currentActivity) {
        InAppBrowserModule.redirectReject(new Error(InAppBrowserModule.ERROR_CODE));
        this.flowDidFinish();
        return;
      }
  
      BROWSER_ACTIVITY_EVENTS.off(DISMISSED_EVENT);
  
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
      options?: InAppBrowserOptions,
    ) {
      let response = null;
      try {
        response = await openAuthSessionPolyfillAsync(
          (startUrl, opt) => this.open(startUrl, opt), url, redirectUrl, options
        );
      } finally {
        closeAuthSessionPolyfillAsync();
        this.close();
      }
      return response;
    }
  
    public closeAuth(): void {
      closeAuthSessionPolyfillAsync();
      this.close();
    }
  
    public onEvent(event: EventData): void {
      BROWSER_ACTIVITY_EVENTS.off(DISMISSED_EVENT);
  
      if (!InAppBrowserModule.redirectResolve) {
        return;
      }
      const browserEvent = <ChromeTabsEvent>event.object;
      if (browserEvent.isError) {
        InAppBrowserModule.redirectReject(new Error(browserEvent.message));
      } else {
        InAppBrowserModule.redirectResolve({
          type: browserEvent.resultType,
          message: browserEvent.message
        } as BrowserResult);
      }
      this.flowDidFinish();
    }
  
    private registerEvent(): void {
      BROWSER_ACTIVITY_EVENTS.once(DISMISSED_EVENT, (e) => this.onEvent(e));
    }
  
    private resolveAnimationIdentifierIfNeeded(context: Context, identifier: string): number {
      if (this.animationIdentifierPattern.matcher(identifier).find()) {
        return context.getResources().getIdentifier(identifier, null, null);
      } else {
        return context.getResources().getIdentifier(identifier, 'anim', context.getPackageName());
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

  return new InAppBrowserModule();
}

if (typeof InAppBrowserModuleInstance === 'undefined') {
  InAppBrowserModuleInstance = setup();
}
export const InAppBrowser = InAppBrowserModuleInstance;
