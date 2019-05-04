import { Color } from 'tns-core-modules/color';
import { ad } from 'tns-core-modules/utils/utils';
import { android as androidApp } from 'tns-core-modules/application';
import { ChromeTabsEvent, BROWSER_ACTIVITY_EVENTS, createStartIntent } from './ChromeTabsManagerActivity';
import { EventData } from 'tns-core-modules/data/observable';

declare const android: any;
const customtabs = android.support.customtabs || {};
const CustomTabsIntent = customtabs.CustomTabsIntent;
const Intent = android.content.Intent;
const Uri = android.net.Uri;

import {
  BrowserResult,
  AuthSessionResult,
  getDefaultOptions
} from './InAppBrowser.common';

type InAppBrowserOptions = {
  showTitle?: boolean,
  toolbarColor?: string,
  secondaryToolbarColor?: string,
  enableUrlBarHiding?: boolean,
  enableDefaultShare?: boolean,
  forceCloseOnRedirection?: boolean,
  animations?: {
    startEnter: string,
    startExit: string,
    endEnter: string,
    endExit: string
  },
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
  private currentActivity: any;
  //private animationIdentifierPattern = /^.+:.+/;

  constructor() {
    super();
    return global.__native(this);
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  open(url: string, inAppBrowserOptions: InAppBrowserOptions = {}): Promise<BrowserResult> {
    const mOpenBrowserPromise = InAppBrowserModule.redirectResolve;
    if (mOpenBrowserPromise) {
      InAppBrowserModule.redirectResolve = null;
      const response: BrowserResult = { type: 'cancel' };
      return Promise.resolve(response);
    }

    this.currentActivity = androidApp.foregroundActivity || androidApp.startActivity;
    if (!this.currentActivity) {
      return Promise.reject(new Error(InAppBrowserModule.ERROR_CODE));
    }

    const options = getDefaultOptions(url, inAppBrowserOptions);

    const builder = new CustomTabsIntent.Builder();
    if (options[InAppBrowserModule.KEY_TOOLBAR_COLOR]) {
      const colorString = options[InAppBrowserModule.KEY_TOOLBAR_COLOR];
      try {
        builder.setToolbarColor(new Color(colorString).android);
      } catch (error) {
        throw new Error(
                "Invalid toolbar color '" + colorString + "': " + error.message);
      }
    }
    if (options[InAppBrowserModule.KEY_SECONDARY_TOOLBAR_COLOR]) {
      const colorString = options[InAppBrowserModule.KEY_SECONDARY_TOOLBAR_COLOR];
      try {
        builder.setSecondaryToolbarColor(new Color(colorString).android);
      } catch (error) {
        throw new Error(
                "Invalid secondary toolbar color '" + colorString + "': " + error.message);
      }
    }
    if (options[InAppBrowserModule.KEY_ENABLE_URL_BAR_HIDING]) {
      builder.enableUrlBarHiding();
    }
    if (options[InAppBrowserModule.KEY_DEFAULT_SHARE_MENU_ITEM]) {
      builder.addDefaultShareMenuItem();
    }
    const context = ad.getApplicationContext();
    if (options[InAppBrowserModule.KEY_ANIMATIONS]) {
      // const animations = options[InAppBrowserModule.KEY_ANIMATIONS];
      // applyAnimation(context, builder, animations);
    }

    const customTabsIntent = builder.build();
    if (options[InAppBrowserModule.KEY_FORCE_CLOSE_ON_REDIRECTION]) {
      customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
      customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    }

    const intent = customTabsIntent.intent;
    intent.setData(Uri.parse(new java.lang.String(url)));
    if (options[InAppBrowserModule.KEY_SHOW_PAGE_TITLE]) {
      builder.setShowTitle(!!options[InAppBrowserModule.KEY_SHOW_PAGE_TITLE]);
    }
    else {
      intent.putExtra(CustomTabsIntent.EXTRA_TITLE_VISIBILITY_STATE, CustomTabsIntent.NO_TITLE);
    }

    this.registerEvent();

    this.currentActivity.startActivity(
      createStartIntent(this.currentActivity, intent)
    );

    return new Promise(function (resolve) {
      InAppBrowserModule.redirectResolve = resolve;
    });
  }

  public onEvent(event: EventData): void {
    alert("Hey");
    const browserEvent = <ChromeTabsEvent>event.object;
    BROWSER_ACTIVITY_EVENTS.off('dismiss');
    InAppBrowserModule.redirectResolve({ type: browserEvent.resultType });
    InAppBrowserModule.redirectResolve = null;
    alert("Good");
  }

  private registerEvent(): void {
    BROWSER_ACTIVITY_EVENTS.on('dismiss', this.onEvent);
  }
}

export default new InAppBrowserModule();