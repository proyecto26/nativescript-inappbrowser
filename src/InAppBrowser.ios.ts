import { Utils } from "@nativescript/core";
import { parseColor, log } from "./utils.common";

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
} from "./InAppBrowser.common";
import {
  getTransitionStyle,
  getPresentationStyle,
  setModalInPresentation,
  dismissWithoutAnimation,
  InAppBrowserOpenAuthErrorMessage,
} from "./utils.ios";

const DEFAULT_PROTOCOLS = [
  SFSafariViewControllerDelegate,
  UIAdaptivePresentationControllerDelegate,
];
const protocols =
  Utils.ios.MajorVersion >= 13
    ? [...DEFAULT_PROTOCOLS, ASWebAuthenticationPresentationContextProviding]
    : DEFAULT_PROTOCOLS;

let InAppBrowserModuleInstance: any;

function setup() {
  @NativeClass()
  class InAppBrowserModule
    extends NSObject
    implements InAppBrowserClassMethods
  {
    public static ObjCProtocols = protocols;

    private safariVC: SFSafariViewController = null;
    private redirectResolve: RedirectResolve = null;
    private redirectReject: RedirectReject = null;
    private authSession: SFAuthenticationSession | ASWebAuthenticationSession =
      null;
    private animated = false;

    public isAvailable(): Promise<boolean> {
      return Promise.resolve(Utils.ios.MajorVersion >= 9);
    }

    private initializeWebBrowser(
      resolve: RedirectResolve,
      reject: RedirectReject
    ) {
      if (this.redirectReject) {
        this.redirectReject(new Error(InAppBrowserErrorMessage));
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

        const {
          url,
          animated,
          enableBarCollapsing,
          readerMode,
          dismissButtonStyle,
          preferredBarTintColor,
          preferredControlTintColor,
          modalEnabled,
          modalPresentationStyle,
          modalTransitionStyle,
          formSheetPreferredContentSize,
        } = getDefaultOptions(authURL, options);
        this.animated = animated;

        try {
          // Safari View Controller to authorize request
          const authURL = NSURL.URLWithString(url);
          if (Utils.ios.MajorVersion >= 11) {
            const config = SFSafariViewControllerConfiguration.alloc().init();
            config.barCollapsingEnabled = enableBarCollapsing;
            config.entersReaderIfAvailable = readerMode;
            this.safariVC =
              SFSafariViewController.alloc().initWithURLConfiguration(
                authURL,
                config
              );
          } else {
            this.safariVC =
              SFSafariViewController.alloc().initWithURLEntersReaderIfAvailable(
                authURL,
                readerMode
              );
          }
        } catch (error) {
          reject(new Error("Unable to open url."));
          this.flowDidFinish();
          log(`InAppBrowser: ${error}`);
          return;
        }

        this.safariVC.delegate = this;

        if (Utils.ios.MajorVersion >= 11) {
          if (dismissButtonStyle === DISMISS_BUTTON_STYLES.DONE) {
            this.safariVC.dismissButtonStyle =
              SFSafariViewControllerDismissButtonStyle.Done;
          } else if (dismissButtonStyle === DISMISS_BUTTON_STYLES.CLOSE) {
            this.safariVC.dismissButtonStyle =
              SFSafariViewControllerDismissButtonStyle.Close;
          } else if (dismissButtonStyle === DISMISS_BUTTON_STYLES.CANCEL) {
            this.safariVC.dismissButtonStyle =
              SFSafariViewControllerDismissButtonStyle.Cancel;
          }
        }

        if (Utils.ios.MajorVersion >= 10) {
          if (preferredBarTintColor) {
            const color = parseColor(preferredBarTintColor);
            if (color) {
              this.safariVC.preferredBarTintColor = color.ios;
            }
          }
          if (preferredControlTintColor) {
            const color = parseColor(preferredControlTintColor);
            if (color) {
              this.safariVC.preferredControlTintColor = color.ios;
            }
          }
        }

        const ctrl =
          UIApplication.sharedApplication.keyWindow.rootViewController;
        if (modalEnabled) {
          // This is a hack to present the SafariViewController modally
          const safariHackVC =
            UINavigationController.alloc().initWithRootViewController(
              this.safariVC
            );
          safariHackVC.setNavigationBarHiddenAnimated(true, false);

          // To disable "Swipe to dismiss" gesture which sometimes causes a bug where `safariViewControllerDidFinish`
          // is not called.
          this.safariVC.modalPresentationStyle =
            UIModalPresentationStyle.OverFullScreen;
          safariHackVC.modalPresentationStyle = getPresentationStyle(
            modalPresentationStyle
          );
          if (this.animated) {
            safariHackVC.modalTransitionStyle =
              getTransitionStyle(modalTransitionStyle);
          }

          if (
            safariHackVC.modalPresentationStyle ===
              UIModalPresentationStyle.FormSheet &&
            formSheetPreferredContentSize
          ) {
            const width = formSheetPreferredContentSize.width;
            const height = formSheetPreferredContentSize.height;
            if (width && height) {
              safariHackVC.preferredContentSize = CGSizeMake(width, height);
            }
          }

          if (Utils.ios.MajorVersion >= 13) {
            safariHackVC.modalInPresentation = true;
            if (safariHackVC[setModalInPresentation])
              safariHackVC[setModalInPresentation](true);
          }
          safariHackVC.presentationController.delegate = this;

          ctrl.presentViewControllerAnimatedCompletion(
            safariHackVC,
            animated,
            null
          );
        } else {
          ctrl.presentViewControllerAnimatedCompletion(
            this.safariVC,
            animated,
            null
          );
        }
      });
    }
    public close() {
      const ctrl = UIApplication.sharedApplication.keyWindow.rootViewController;
      ctrl.dismissViewControllerAnimatedCompletion(this.animated, () => {
        if (this.redirectResolve) {
          this.redirectResolve({
            type: "dismiss",
          });
          this.flowDidFinish();
        }
      });
    }
    public async openAuth(
      authUrl: string,
      redirectUrl: string,
      options?: InAppBrowserOptions
    ): Promise<AuthSessionResult> {
      const ephemeralWebSession = !!options?.ephemeralWebSession;
      if (Utils.ios.MajorVersion >= 11) {
        return new Promise<AuthSessionResult>((resolve, reject) => {
          if (!this.initializeWebBrowser(resolve, reject)) return;

          const url = NSURL.URLWithString(authUrl);
          const escapedRedirectURL = NSURL.URLWithString(redirectUrl).scheme;
          this.authSession = (
            Utils.ios.MajorVersion >= 12
              ? ASWebAuthenticationSession
              : SFAuthenticationSession
          )
            .alloc()
            .initWithURLCallbackURLSchemeCompletionHandler(
              url,
              escapedRedirectURL,
              (callbackURL, error) => {
                if (this.redirectResolve) {
                  if (!error) {
                    this.redirectResolve({
                      type: BROWSER_TYPES.SUCCESS,
                      url: callbackURL.absoluteString,
                    });
                  } else {
                    this.redirectResolve({
                      type: BROWSER_TYPES.CANCEL,
                    });
                  }
                  this.flowDidFinish();
                }
              }
            );
          if (Utils.ios.MajorVersion >= 13) {
            const webAuthSession = this
              .authSession as ASWebAuthenticationSession;
            // Prevent re-use cookie from last auth session
            webAuthSession.prefersEphemeralWebBrowserSession =
              ephemeralWebSession;
            webAuthSession.presentationContextProvider = this;
          }
          this.authSession.start();
        });
      } else {
        this.flowDidFinish();
        const response: AuthSessionResult = {
          type: BROWSER_TYPES.CANCEL,
          message: InAppBrowserOpenAuthErrorMessage,
        };
        return Promise.resolve(response);
      }
    }
    public closeAuth() {
      if (Utils.ios.MajorVersion >= 11) {
        const authSession:
          | SFAuthenticationSession
          | ASWebAuthenticationSession = this.authSession;
        authSession.cancel();
        if (this.redirectResolve) {
          this.redirectResolve({
            type: BROWSER_TYPES.DISMISS,
          });
          this.flowDidFinish();
        }
      } else {
        this.close();
      }
    }
    public presentationAnchorForWebAuthenticationSession(
      _: ASWebAuthenticationSession
    ): UIWindow {
      return UIApplication.sharedApplication.keyWindow;
    }
    public safariViewControllerDidFinish(
      controller: SFSafariViewController
    ): void {
      if (this.redirectResolve) {
        this.redirectResolve({
          type: BROWSER_TYPES.CANCEL,
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

if (typeof InAppBrowserModuleInstance === "undefined") {
  InAppBrowserModuleInstance = setup();
}
export const InAppBrowser = <InAppBrowserClassMethods>(
  InAppBrowserModuleInstance
);
