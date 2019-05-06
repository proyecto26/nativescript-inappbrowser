import {
  on as onEvent,
  off as offEvent,
  android,
  resumeEvent,
  ApplicationEventData,
} from 'tns-core-modules/application';

export type RedirectEvent = {
  url: 'string'
};

export type BrowserResult = {
  type: 'cancel' | 'dismiss'
  message?: string
};

export type RedirectResult = {
  type: 'success',
  url: string
};

export type AuthSessionResult = RedirectResult | BrowserResult;

export function getDefaultOptions(url, options) {
  return {
    ...options,
    url,
    dismissButtonStyle: options.dismissButtonStyle || 'close',
    readerMode: options.readerMode !== undefined ? options.readerMode : false
  };
}

let _redirectHandler: (args: ApplicationEventData) => void;

function _waitForRedirectAsync(returnUrl: string): Promise<RedirectResult> {
  return new Promise(resolve => {
    _redirectHandler = (args: ApplicationEventData) => {
      let url = '';
      if (android) {
        const currentActivity = args.object.foregroundActivity || args.object.startActivity;
        url += currentActivity.getIntent().getData();
      }
      if (url.startsWith(returnUrl)) {
        resolve({ url: url, type: 'success' });
      }
    };
    onEvent(resumeEvent, _redirectHandler);
  });
}

/* Android polyfill for AuthenticationSession flow */
export function openAuthSessionPolyfillAsync(
  startUrl: string,
  returnUrl: string,
  options: any,
  open: (
    url: string,
    options?: any,
  ) => Promise<BrowserResult>
): Promise<AuthSessionResult> {
  return Promise.race([_waitForRedirectAsync(returnUrl), open(startUrl, options)]);
}

export function closeAuthSessionPolyfillAsync(): void {
  if (_redirectHandler) {
    offEvent(resumeEvent, _redirectHandler);
    _redirectHandler = null;
  }
}