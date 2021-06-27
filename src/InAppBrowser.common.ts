import { Color } from "@nativescript/core";

export interface RedirectEvent {
  url: 'string';
}

export interface BrowserResult {
  type: 'cancel' | 'dismiss';
  message?: string;
}

export interface RedirectResult {
  type: 'success';
  url: string;
}

type InAppBrowseriOSOptions = {
  dismissButtonStyle?: 'done' | 'close' | 'cancel',
  preferredBarTintColor?: string | Color,
  preferredControlTintColor?: string | Color,
  readerMode?: boolean,
  animated?: boolean,
  modalPresentationStyle?:
    | 'automatic'
    | 'fullScreen'
    | 'pageSheet'
    | 'formSheet'
    | 'currentContext'
    | 'custom'
    | 'overFullScreen'
    | 'overCurrentContext'
    | 'popover'
    | 'none',
  modalTransitionStyle?:
    | 'coverVertical'
    | 'flipHorizontal'
    | 'crossDissolve'
    | 'partialCurl',
  modalEnabled?: boolean,
  enableBarCollapsing?: boolean,
  ephemeralWebSession?: boolean,
};

export type Animations = {
  startEnter: string,
  startExit: string,
  endEnter: string,
  endExit: string
};

type InAppBrowserAndroidOptions = {
  showTitle?: boolean,
  toolbarColor?: string | Color,
  secondaryToolbarColor?: string | Color,
  navigationBarColor?: string | Color,
  navigationBarDividerColor?: string | Color,
  enableUrlBarHiding?: boolean,
  enableDefaultShare?: boolean,
  forceCloseOnRedirection?: boolean,
  animations?: Animations,
  headers?: { [key: string]: string },
  hasBackButton?: boolean,
  browserPackage?: string,
  showInRecents?: boolean,
};

export type InAppBrowserOptions = InAppBrowserAndroidOptions & InAppBrowseriOSOptions;

export type AuthSessionResult = RedirectResult | BrowserResult;

export type OpenBrowserAsync = (
  url: string,
  options?: InAppBrowserOptions
) => Promise<BrowserResult>;

export interface InAppBrowserClassMethods {
  open: OpenBrowserAsync;
  close: () => void;
  openAuth: (
    url: string,
    redirectUrl: string,
    options?: InAppBrowserOptions,
  ) => Promise<AuthSessionResult>;
  closeAuth: () => void;
  isAvailable: () => Promise<boolean>;
}

export type RedirectResolve = (value?: AuthSessionResult | PromiseLike<AuthSessionResult>) => void;
export type RedirectReject = (reason?: Error) => void;

export const InAppBrowserErrorMessage = 'Another InAppBrowser is already being presented.';

export enum BROWSER_TYPES {
  CANCEL = 'cancel',
  DISMISS = 'dismiss',
  SUCCESS = 'success'
}

export enum DISMISS_BUTTON_STYLES {
  DONE = 'done',
  CLOSE = 'close',
  CANCEL = 'cancel'
}

export function getDefaultOptions(
  url: string,
  options: InAppBrowserOptions = {
    animated: true,
    modalEnabled: true,
    dismissButtonStyle: 'close',
    readerMode: false,
    enableBarCollapsing: false,
  }
): InAppBrowserOptions & { url: string } {
  return {
    ...options,
    url,
  };
}
