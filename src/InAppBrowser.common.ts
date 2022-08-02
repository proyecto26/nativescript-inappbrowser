import { Color } from "@nativescript/core";

export interface RedirectEvent {
  url: "string";
}

export interface BrowserResult {
  type: "cancel" | "dismiss";
  message?: string;
}

export interface RedirectResult {
  type: "success";
  url: string;
}

type InAppBrowseriOSOptions = {
  dismissButtonStyle?: "done" | "close" | "cancel";
  preferredBarTintColor?: string | Color;
  preferredControlTintColor?: string | Color;
  readerMode?: boolean;
  animated?: boolean;
  modalPresentationStyle?:
    | "automatic"
    | "fullScreen"
    | "pageSheet"
    | "formSheet"
    | "currentContext"
    | "custom"
    | "overFullScreen"
    | "overCurrentContext"
    | "popover"
    | "none";
  modalTransitionStyle?:
    | "coverVertical"
    | "flipHorizontal"
    | "crossDissolve"
    | "partialCurl";
  modalEnabled?: boolean;
  enableBarCollapsing?: boolean;
  ephemeralWebSession?: boolean;
  formSheetPreferredContentSize?: { width: number; height: number };
};

export type Animations = {
  startEnter: string;
  startExit: string;
  endEnter: string;
  endExit: string;
};

type InAppBrowserAndroidOptions = {
  showTitle?: boolean;
  toolbarColor?: string | Color;
  secondaryToolbarColor?: string | Color;
  navigationBarColor?: string | Color;
  navigationBarDividerColor?: string | Color;
  enableUrlBarHiding?: boolean;
  enableDefaultShare?: boolean;
  forceCloseOnRedirection?: boolean;
  animations?: Animations;
  headers?: { [key: string]: string };
  hasBackButton?: boolean;
  browserPackage?: string;
  showInRecents?: boolean;
  includeReferrer?: boolean;
};

export type InAppBrowserOptions = InAppBrowserAndroidOptions &
  InAppBrowseriOSOptions;

export type AuthSessionResult = RedirectResult | BrowserResult;

export type OpenBrowserAsync = (
  url: string,
  options?: InAppBrowserOptions
) => Promise<BrowserResult>;

export interface InAppBrowserClassMethods {
  /**
   * Opens the url with Safari in a modal on iOS using [`SFSafariViewController`](https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller),
   * or Chrome in a new [custom tab](https://developer.chrome.com/multidevice/android/customtabs) on Android.
   *
   * @param url The url to open in the web browser.
   * @param options A dictionary of key-value pairs.
   *
   * @return The promise behaves differently based on the platform:
   * - If the user closed the web browser, the Promise resolves with `{ type: 'cancel' }`.
   * - If the browser is closed using `close`, the Promise resolves with `{ type: 'dismiss' }`.
   */
  open: OpenBrowserAsync;
  /**
   * Dismisses the presented web browser.
   */
  close: () => void;
  /**
   * # On iOS:
   * Opens the url with Safari in a modal using `ASWebAuthenticationSession`. The user will be asked
   * whether to allow the app to authenticate using the given url.
   *
   * # On Android:
   * This will be done using a "custom Chrome tabs" browser and [activityResumedEvent](https://docs.nativescript.org/api-reference/classes/androidapplication#activityresumedevent),
   *
   * @param url The url to open in the web browser. This should be a login page.
   * @param redirectUrl _Optional_ - The url to deep link back into your app.
   * @param options _Optional_ - An object extending the InAppBrowser Options.
   *
   * @return
   * - If the user does not permit the application to authenticate with the given url, the Promise fulfills with `{ type: 'cancel' }` object.
   * - If the user closed the web browser, the Promise fulfills with `{ type: 'cancel' }` object.
   * - If the browser is closed using `dismissBrowser`, the Promise fulfills with `{ type: 'dismiss' }` object.
   */
  openAuth: (
    url: string,
    redirectUrl: string,
    options?: InAppBrowserOptions
  ) => Promise<AuthSessionResult>;
  /**
   * Dismisses the current authentication session
   */
  closeAuth: () => void;
  /**
   * Detect if the device supports this plugin.
   */
  isAvailable: () => Promise<boolean>;
  /**
   * Initialize a bound background service so the application can communicate its intention to the browser.
   * After the service is connected, the client can be used to warms up the browser to make navigation faster and indicates that a given URL may be loaded in the future.
   *
   * @platform android
   */
  onStart(): void;
  /**
   * Warm up the browser process.
   * Allows the browser application to pre-initialize itself in the background.
   * Significantly speeds up URL opening in the browser.
   * This is synchronous and can be called several times.
   *
   * @platform android
   */
  warmup: () => boolean;
  /**
   * Tells the browser of a likely future navigation to a URL.
   * The most likely URL has to be specified first.
   * Optionally, a list of other likely URLs can be provided.
   * They are treated as less likely than the first one, and have to be sorted in decreasing priority order.
   * These additional URLs may be ignored.
   *
   * @param mostLikelyUrl Most likely URL, may be null if otherUrls is provided.
   * @param otherUrls Other likely destinations, sorted in decreasing likelihood order.
   *
   * @platform android
   */
  mayLaunchUrl: (mostLikelyUrl: string, otherUrls: Array<string>) => void;
}

export type RedirectResolve = (
  value?: AuthSessionResult | PromiseLike<AuthSessionResult>
) => void;
export type RedirectReject = (reason?: Error) => void;

export const InAppBrowserErrorMessage =
  "Another InAppBrowser is already being presented.";

export enum BROWSER_TYPES {
  CANCEL = "cancel",
  DISMISS = "dismiss",
  SUCCESS = "success",
}

export enum DISMISS_BUTTON_STYLES {
  DONE = "done",
  CLOSE = "close",
  CANCEL = "cancel",
}

export function getDefaultOptions(
  url: string,
  options: InAppBrowserOptions = {
    animated: true,
    modalEnabled: true,
    dismissButtonStyle: "close",
    readerMode: false,
    enableBarCollapsing: false,
  }
): InAppBrowserOptions & { url: string } {
  return {
    ...options,
    url,
  };
}
