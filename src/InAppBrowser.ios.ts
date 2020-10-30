import { Color, Utils } from '@nativescript/core';

import {
  BrowserResult,
  AuthSessionResult,
  getDefaultOptions,
  RedirectResolve,
  RedirectReject,
  BROWSER_TYPES,
  InAppBrowserOptions,
  DISMISS_BUTTON_STYLES,
  InAppBrowserErrorMessage,
  InAppBrowserClassMethods,
} from './InAppBrowser.common';
import {
  getTransitionStyle,
  getPresentationStyle,
  setModalInPresentation,
  dismissWithoutAnimation,
  InAppBrowserOpenAuthErrorMessage,
} from './utils.ios';

const DEFAULT_PROTOCOLS = [
  SFSafariViewControllerDelegate,
  UIAdaptivePresentationControllerDelegate
];
const protocols = Utils.ios.MajorVersion >= 13 ? [
  ...DEFAULT_PROTOCOLS,
  ASWebAuthenticationPresentationContextProviding
] : DEFAULT_PROTOCOLS;

let InAppBrowserModuleInstance: any;

function setup() {
  @NativeClass()
  class InAppBrowserModule extends NSObject implements InAppBrowserClassMethods {
  
    public static ObjCProtocols = protocols;
  
    private safariVC: SFSafariViewController = null;
    private redirectResolve: RedirectResolve = null;
    private redirectReject: RedirectReject = null;
    private authSession: SFAuthenticationSession | ASWebAuthenticationSession = null;
    private animated = false;
  
    public isAvailable(): Promise<boolean> {
      return Promise.resolve(Utils.ios.MajorVersion >= 9);
    }

    private initializeWebBrowser (
      resolve: RedirectResolve,
      reject: RedirectReject
    ) {
      if (this.redirectReject) {
        this.redirectReject(InAppBrowserErrorMessage);
        return false;
      }
      this.redirectResolve = resolve;
      this.redirectReject = reject;
      return true;
    }

    public open(
      authURL: string,
      options?: InAppBrowserOptions
    ): Promise<BrowserResult> {
      return new Promise((resolve, reject) => {
        if (!this.initializeWebBrowser(resolve, reject)) return;
  
        const inAppBrowserOptions = getDefaultOptions(authURL, options);
        this.animated = inAppBrowserOptions.animated;
  
        const url = NSURL.URLWithString(inAppBrowserOptions.url);
        if (Utils.ios.MajorVersion >= 11) {
          const config = SFSafariViewControllerConfiguration.alloc().init();
          config.barCollapsingEnabled = inAppBrowserOptions.enableBarCollapsing;
          config.entersReaderIfAvailable = inAppBrowserOptions.readerMode;
          this.safariVC = SFSafariViewController.alloc().initWithURLConfiguration(url, config);
        } else {
          this.safariVC = SFSafariViewController.alloc().initWithURLEntersReaderIfAvailable(
            url,
            inAppBrowserOptions.readerMode
          );
        }
        this.safariVC.delegate = this;
  
        if (Utils.ios.MajorVersion >= 11) {
          if (inAppBrowserOptions.dismissButtonStyle === DISMISS_BUTTON_STYLES.DONE) {
            this.safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Done;
          }
          else if (inAppBrowserOptions.dismissButtonStyle === DISMISS_BUTTON_STYLES.CLOSE) {
            this.safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Close;
          }
          else if (inAppBrowserOptions.dismissButtonStyle === DISMISS_BUTTON_STYLES.CANCEL) {
            this.safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Cancel;
          }
        }
  
        if (Utils.ios.MajorVersion >= 10) {
          if (inAppBrowserOptions.preferredBarTintColor) {
            this.safariVC.preferredBarTintColor = new Color(inAppBrowserOptions.preferredBarTintColor).ios;
          }
          if (inAppBrowserOptions.preferredControlTintColor) {
            this.safariVC.preferredControlTintColor = new Color(inAppBrowserOptions.preferredControlTintColor).ios;
          }
        }
  
        const ctrl = UIApplication.sharedApplication.keyWindow.rootViewController;
  
        if (inAppBrowserOptions.modalEnabled) {
          // This is a hack to present the SafariViewController modally
          const safariHackVC = UINavigationController.alloc().initWithRootViewController(this.safariVC);
          safariHackVC.setNavigationBarHiddenAnimated(true, false);
          safariHackVC.modalPresentationStyle = getPresentationStyle(inAppBrowserOptions.modalPresentationStyle);
          if (this.animated) {
            safariHackVC.modalTransitionStyle = getTransitionStyle(inAppBrowserOptions.modalTransitionStyle);
          }
          if (Utils.ios.MajorVersion >= 13) {
            safariHackVC.modalInPresentation = true;
            if (safariHackVC[setModalInPresentation])
              safariHackVC[setModalInPresentation](true);
          }
          safariHackVC.presentationController.delegate = this;
  
          ctrl.presentViewControllerAnimatedCompletion(safariHackVC, inAppBrowserOptions.animated, null);
        }
        else {
          ctrl.presentViewControllerAnimatedCompletion(this.safariVC, inAppBrowserOptions.animated, null);
        }
      });
    }
    public close() {
      const ctrl = UIApplication.sharedApplication.keyWindow.rootViewController;
      ctrl.dismissViewControllerAnimatedCompletion(this.animated, () => {
        if (this.redirectResolve) {
          this.redirectResolve({
            type: 'dismiss'
          });
          this.flowDidFinish();
        }
      });
    }
    public async openAuth(
      authUrl: string,
      redirectUrl: string,
      options: InAppBrowserOptions = {}
    ): Promise<AuthSessionResult> {
      const inAppBrowserOptions = {
        ...options,
        ephemeralWebSession: options.ephemeralWebSession !== undefined ? options.ephemeralWebSession : false,
      };
      if (Utils.ios.MajorVersion >= 11) {
        return new Promise<AuthSessionResult>((resolve, reject) => {
          if (!this.initializeWebBrowser(resolve, reject)) return;
  
          const url = NSURL.URLWithString(authUrl);
          this.authSession = (
            Utils.ios.MajorVersion >= 12 ? ASWebAuthenticationSession : SFAuthenticationSession
          ).alloc().initWithURLCallbackURLSchemeCompletionHandler(
            url,
            redirectUrl,
            (callbackURL, error) => {
              if (!error) {
                this.redirectResolve({
                  type: BROWSER_TYPES.SUCCESS,
                  url: callbackURL.absoluteString
                });
              }
              else {
                this.redirectResolve({
                  type: BROWSER_TYPES.CANCEL
                });
              }
              this.flowDidFinish();
            }
          );
          if (Utils.ios.MajorVersion >= 13) {
            const webAuthSession = this.authSession as ASWebAuthenticationSession;
            // Prevent re-use cookie from last auth session
            webAuthSession.prefersEphemeralWebBrowserSession = inAppBrowserOptions.ephemeralWebSession;
            webAuthSession.presentationContextProvider = this;
          }
          this.authSession.start();
        });
      }
      else {
        this.flowDidFinish();
        const response: AuthSessionResult = {
          type: BROWSER_TYPES.CANCEL,
          message: InAppBrowserOpenAuthErrorMessage
        };
        return Promise.resolve(response);
      }
    }
    public closeAuth() {
      if (Utils.ios.MajorVersion >= 11) {
        const authSession: SFAuthenticationSession | ASWebAuthenticationSession = this.authSession;
        authSession.cancel();
        if (this.redirectResolve) {
          this.redirectResolve({
            type: BROWSER_TYPES.DISMISS
          });
          this.flowDidFinish();
        }
      }
      else {
        this.close();
      }
    }
    public presentationAnchorForWebAuthenticationSession(_: ASWebAuthenticationSession): UIWindow {
      return UIApplication.sharedApplication.keyWindow;
    }
    public safariViewControllerDidFinish(
      controller: SFSafariViewController
    ): void {
      if (this.redirectResolve) {
        this.redirectResolve({
          type: BROWSER_TYPES.CANCEL
        });
      }
      this.flowDidFinish();
      if (!this.animated) {
        dismissWithoutAnimation(controller);
      }
    }
    private flowDidFinish() {
      this.safariVC = null;
      this.redirectResolve = null;
      this.redirectReject = null;
    }
  }

  return InAppBrowserModule.new();
}

if (typeof InAppBrowserModuleInstance === 'undefined') {
  InAppBrowserModuleInstance = setup();
}
export const InAppBrowser = <InAppBrowserClassMethods>InAppBrowserModuleInstance;
