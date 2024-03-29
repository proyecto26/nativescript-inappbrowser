import Activity = android.app.Activity;
import Intent = android.content.Intent;
import NfcAdapter = android.nfc.NfcAdapter;
import Context = android.content.Context;
import ResolveInfo = android.content.pm.ResolveInfo;
import List = java.util.List;
import Arrays = java.util.Arrays;

import {
  AndroidActivityEventData,
  AndroidApplication,
  Application,
  ApplicationEventData,
  Utils,
} from "@nativescript/core";
import {
  AuthSessionResult,
  BrowserResult,
  BROWSER_TYPES,
  RedirectResult,
} from "./InAppBrowser.common";

export function useAndroidX() {
  return global.androidx && global.androidx.browser;
}

export type Builder = androidx.browser.customtabs.CustomTabsIntent.Builder;
export const CustomTabsIntent = (
  useAndroidX() ? androidx.browser : android.support
).customtabs.CustomTabsIntent;
export const CustomTabsClient = (
  useAndroidX() ? androidx.browser : android.support
).customtabs.CustomTabsClient;
export const CustomTabsServiceConnection = (
  useAndroidX() ? androidx.browser : android.support
).customtabs.CustomTabsServiceConnection;
export const CustomTabsService = (
  useAndroidX() ? androidx.browser : android.support
).customtabs.CustomTabsService;
export const CustomTabsCallback = (
  useAndroidX() ? androidx.browser : android.support
).customtabs.CustomTabsCallback;

export const ColorUtils: typeof androidx.core.graphics.ColorUtils = (
  useAndroidX() ? androidx.core.graphics : (android.support.v4.graphics as any)
).ColorUtils;

export const CHROME_PACKAGE_STABLE = "com.android.chrome";
export const CHROME_PACKAGE_BETA = "com.chrome.beta";
export const CHROME_PACKAGE_DEV = "com.chrome.dev";
export const LOCAL_PACKAGE = "com.google.android.apps.chrome";
export const ACTION_CUSTOM_TABS_CONNECTION =
  "android.support.customtabs.action.CustomTabsService";
export const ARROW_BACK_BLACK = "ic_arrow_back_black";
export const ARROW_BACK_WHITE = "ic_arrow_back_white";
export const DISMISSED_EVENT = "DismissedEvent";

/**
 * Save the handler of the redirection event in order to removes listener later.
 */
let _redirectHandler: (args: ApplicationEventData) => void;

/**
 * Save the previous url in order to avoid loading the same data for a new Authentication flow.
 */
let initialUrl = "";

export const getDrawableId = Utils.ad.resources.getDrawableId;

/**
 * Get the url when the app is opened and clear the data for security concerns.
 * @param activity - Current Android Activity.
 */
export function getInitialURL(activity: Activity): string {
  if (activity) {
    const intent = activity.getIntent();
    const action = intent.getAction();
    const uri = intent.getData();
    if (
      uri !== null &&
      (Intent.ACTION_VIEW === action ||
        NfcAdapter.ACTION_NDEF_DISCOVERED === action)
    ) {
      const url = "" + uri;
      if (url === initialUrl) return null;
      initialUrl = url;
      return url;
    }
  }
  return null;
}

function waitForRedirectAsync(returnUrl: string): Promise<RedirectResult> {
  return new Promise((resolve) => {
    _redirectHandler = (args: ApplicationEventData) => {
      const url = getInitialURL(args.android);
      if (url && url.startsWith(returnUrl)) {
        resolve({ url: url, type: BROWSER_TYPES.SUCCESS });
      }
    };
    Application.on(Application.resumeEvent, _redirectHandler);
  });
}

/**
 * Detect Android Activity `OnResume` event once
 */
function handleAppStateActiveOnce(): Promise<Activity> {
  return new Promise(function (resolve) {
    // Browser can be closed before handling AppState change
    if (!Application.android.paused && Application.android.foregroundActivity) {
      resolve(Application.android.foregroundActivity);
    }
    function handleAppStateChange(args: AndroidActivityEventData) {
      resolve(args.activity);
    }
    Application.android.once(
      AndroidApplication.activityResumedEvent,
      handleAppStateChange
    );
  });
}

async function checkResultAndReturnUrl(
  returnUrl: string,
  result: AuthSessionResult
): Promise<AuthSessionResult> {
  if (Application.android && result.type !== BROWSER_TYPES.CANCEL) {
    try {
      const activity = await handleAppStateActiveOnce();
      const url = getInitialURL(activity);
      return url && url.startsWith(returnUrl)
        ? { url: url, type: BROWSER_TYPES.SUCCESS }
        : result;
    } catch (error) {
      return result;
    }
  }
  return result;
}

/* Android polyfill for AuthenticationSession flow */
export async function openAuthSessionPolyfillAsync(
  open: () => Promise<BrowserResult>,
  returnUrl: string
): Promise<AuthSessionResult> {
  return await Promise.race([
    open().then(function (result) {
      return checkResultAndReturnUrl(returnUrl, result);
    }),
    waitForRedirectAsync(returnUrl),
  ]);
}

export function closeAuthSessionPolyfillAsync(): void {
  if (_redirectHandler) {
    Application.off(Application.resumeEvent, _redirectHandler);
    _redirectHandler = null;
  }
}

export function getPreferredPackages(context: Context): List<ResolveInfo> {
  const serviceIntent = new Intent(ACTION_CUSTOM_TABS_CONNECTION);
  const resolveInfos = context
    .getPackageManager()
    .queryIntentServices(serviceIntent, 0);
  return resolveInfos;
}

export function toolbarIsLight(themeColor: number): boolean {
  return ColorUtils.calculateLuminance(themeColor) > 0.5;
}

export function getDefaultBrowser(context: Context): string {
  const resolveInfos = getPreferredPackages(context);
  const packageName = CustomTabsClient.getPackageName(
    context,
    Arrays.asList([
      CHROME_PACKAGE_STABLE,
      CHROME_PACKAGE_BETA,
      CHROME_PACKAGE_DEV,
      LOCAL_PACKAGE,
    ])
  );
  if (packageName == null && resolveInfos != null && resolveInfos.size() > 0) {
    return resolveInfos.get(0).serviceInfo.packageName;
  }
  return packageName;
}
