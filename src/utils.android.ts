import Activity = android.app.Activity;
import Intent = android.content.Intent;
import NfcAdapter = android.nfc.NfcAdapter;

import {
  Application,
  ApplicationEventData,
  AndroidApplication,
  AndroidActivityEventData
} from '@nativescript/core';
import {
  RedirectResult,
  BrowserResult,
  AuthSessionResult,
  BROWSER_TYPES
} from './InAppBrowser.common';

let _redirectHandler: (args: ApplicationEventData) => void;

/**
 * Get the url when the app is opened and clear the data for security concerns.
 * @param activity - Current Android Activity.
 */
export function getInitialURL(activity: Activity): string {
  if (activity) {
    const intent = activity.getIntent();
    const action = intent.getAction();
    const uri = intent.getData();
    if (uri !== null && (
      Intent.ACTION_VIEW === action ||
      NfcAdapter.ACTION_NDEF_DISCOVERED === action
    )) {
      const url = '' + uri;
      /**
       * Clear initial url
       */
      intent.setData(null);
      return url;
    }
  }
  return null;
}

function _waitForRedirectAsync(
  returnUrl: string
): Promise<RedirectResult> {
  return new Promise(resolve => {
    _redirectHandler = (args: ApplicationEventData) => {
      const currentActivity = args.object.foregroundActivity || args.object.startActivity;
      const url = getInitialURL(currentActivity);
      if (url && url.startsWith(returnUrl)) {
        resolve({ url: url, type: BROWSER_TYPES.SUCCESS });
      }
    };
    Application.on(Application.resumeEvent, _redirectHandler);
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
  return Promise.race([
    _waitForRedirectAsync(returnUrl),
    open(startUrl, options).then(function(result: AuthSessionResult) {
      return _checkResultAndReturnUrl(returnUrl, result);
    })
  ]);
}

function _checkResultAndReturnUrl(
  returnUrl: string,
  result: AuthSessionResult
): Promise<AuthSessionResult> {
  return new Promise(function(resolve) {
    if (Application.android && result.type !== BROWSER_TYPES.CANCEL) {
      Application.android.once(
        AndroidApplication.activityResumedEvent,
        function(args: AndroidActivityEventData) {
          const url = getInitialURL(args.activity);
          if (url && url.startsWith(returnUrl)) {
            return resolve({ url: url, type: BROWSER_TYPES.SUCCESS });
          } else resolve(result);
        }
      );
    } else {
      resolve(result);
    }
  });
}

export function closeAuthSessionPolyfillAsync(): void {
  if (_redirectHandler) {
    Application.off(Application.resumeEvent, _redirectHandler);
    _redirectHandler = null;
  }
}