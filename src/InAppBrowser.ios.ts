import { Color, Utils } from '@nativescript/core';

import {
  BrowserResult,
  AuthSessionResult,
  getDefaultOptions
} from './InAppBrowser.common';

type InAppBrowserOptions = {
  dismissButtonStyle?: 'done' | 'close' | 'cancel',
  preferredBarTintColor?: string,
  preferredControlTintColor?: string,
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
  ephemeralWebSession?: boolean
};

const getPresentationStyle = function (styleKey: string): UIModalPresentationStyle {
  const styles = {
    none: UIModalPresentationStyle.None,
    fullScreen: UIModalPresentationStyle.FullScreen,
    pageSheet: UIModalPresentationStyle.PageSheet,
    formSheet: UIModalPresentationStyle.FormSheet,
    currentContext: UIModalPresentationStyle.CurrentContext,
    custom: UIModalPresentationStyle.Custom,
    overFullScreen: UIModalPresentationStyle.OverFullScreen,
    overCurrentContext: UIModalPresentationStyle.OverCurrentContext,
    popover: UIModalPresentationStyle.Popover
  };
  const defaultModalPresentationStyle = Utils.ios.MajorVersion >= 13 ?
    UIModalPresentationStyle.Automatic : UIModalPresentationStyle.FullScreen;
  return styles[styleKey] !== undefined ? styles[styleKey] : defaultModalPresentationStyle;
};

const getTransitionStyle = function (styleKey: string): UIModalTransitionStyle {
  const styles = {
    coverVertical: UIModalTransitionStyle.CoverVertical,
    flipHorizontal: UIModalTransitionStyle.FlipHorizontal,
    crossDissolve: UIModalTransitionStyle.CrossDissolve,
    partialCurl: UIModalTransitionStyle.PartialCurl
  };
  return styles[styleKey] !== undefined ? styles[styleKey] : UIModalTransitionStyle.CoverVertical;
};

const DEFAULT_PROTOCOLS = [
  SFSafariViewControllerDelegate,
  UIAdaptivePresentationControllerDelegate
];
const protocols = Utils.ios.MajorVersion >= 13 ? [
  ...DEFAULT_PROTOCOLS,
  ASWebAuthenticationPresentationContextProviding
] : DEFAULT_PROTOCOLS;

class InAppBrowserModule extends NSObject {

  public static ObjCProtocols = protocols;

  private safariVC: SFSafariViewController = null;
  private redirectResolve = null;
  private redirectReject = null;
  private authSession: SFAuthenticationSession | ASWebAuthenticationSession = null;
  private animated = false;

  public isAvailable(): Promise<boolean> {
    return Promise.resolve(Utils.ios.MajorVersion >= 9);
  }
  public open(
    authURL: string,
    options: InAppBrowserOptions = {}
  ): Promise<BrowserResult> {
    return new Promise((resolve, reject) => {
      if (!this.initializeWebBrowser(resolve, reject)) return;

      const inAppBrowserOptions: InAppBrowserOptions = getDefaultOptions(authURL, options);
      this.animated = inAppBrowserOptions.animated;

      const url = NSURL.URLWithString(inAppBrowserOptions['url']);
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
        if (inAppBrowserOptions.dismissButtonStyle === 'done') {
          this.safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Done;
        }
        else if (inAppBrowserOptions.dismissButtonStyle === 'close') {
          this.safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Close;
        }
        else if (inAppBrowserOptions.dismissButtonStyle === 'cancel') {
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
          if (safariHackVC['setModalInPresentation'])
            safariHackVC['setModalInPresentation'](true);
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
                type: 'success',
                url: callbackURL.absoluteString
              });
            }
            else {
              this.redirectResolve({
                type: 'cancel'
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
        type: 'cancel',
        message: 'openAuth requires iOS 11 or greater'
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
          type: 'dismiss'
        });
        this.flowDidFinish();
      }
    }
    else {
      this.close();
    }
  }
  public presentationAnchorForWebAuthenticationSession(session: ASWebAuthenticationSession): UIWindow {
    return UIApplication.sharedApplication.keyWindow;
  }
  private dismissWithoutAnimation(controller: SFSafariViewController): void {
    const transition = CATransition.animation();
    transition.duration = 0;
    transition.timingFunction = CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
    transition.type = kCATransitionFade;
    transition.subtype = kCATransitionFromBottom;

    controller.view.alpha = 0.05;
    controller.view.frame = CGRectMake(0.0, 0.0, 0.5, 0.5);

    const ctrl = UIApplication.sharedApplication.keyWindow.rootViewController;
    const animationKey = 'dismissInAppBrowser';
    ctrl.view.layer.addAnimationForKey(transition, animationKey);
    ctrl.dismissViewControllerAnimatedCompletion(false, () => {
      ctrl.view.layer.removeAnimationForKey(animationKey);
    });
  }
  public safariViewControllerDidFinish(
    controller: SFSafariViewController
  ): void {
    if (!this.animated) {
      this.dismissWithoutAnimation(controller);
    }
    if (this.redirectResolve) {
      this.redirectResolve({
        type: 'cancel'
      });
      this.flowDidFinish();
    }
  }
  private flowDidFinish() {
    this.safariVC = null;
    this.redirectResolve = null;
    this.redirectReject = null;
  }

  private initializeWebBrowser (resolve, reject) {
    if (this.redirectResolve) {
      reject('Another InAppBrowser is already being presented.');
      return false;
    }
    this.redirectResolve = resolve;
    this.redirectReject = reject;
    return true;
  }
}

export default InAppBrowserModule.new() as InAppBrowserModule;
