import { Color } from 'tns-core-modules/color';
import { ios } from 'tns-core-modules/utils/utils';

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
  enableBarCollapsing?: boolean
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
  const defaultModalPresentationStyle = ios.MajorVersion >= 13 ? 
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

const protocols = [
  SFSafariViewControllerDelegate,
  UIAdaptivePresentationControllerDelegate
];
if (ios.MajorVersion >= 13) {
  protocols.push(ASWebAuthenticationPresentationContextProviding);
}

const InAppBrowser = (<any>NSObject).extend({
  safariVC: <SFSafariViewController> null,
  redirectResolve: null,
  redirectReject: null,
  authSession: <SFAuthenticationSession | ASWebAuthenticationSession> null,
  animated: false,
  isAvailable(): Promise<boolean> {
    return Promise.resolve(ios.MajorVersion >= 9);
  },
  open(authURL: string, inAppBrowserOptions: InAppBrowserOptions = {}): Promise<BrowserResult> {
    const self = this;
    return new Promise(function (resolve, reject) {
      if (!self.initializeWebBrowser(resolve, reject)) return;

      const options: InAppBrowserOptions = getDefaultOptions(authURL, inAppBrowserOptions);
      self.animated = options.animated;

      const url = NSURL.URLWithString(options['url']);
      if (ios.MajorVersion >= 11) {
        const config = SFSafariViewControllerConfiguration.alloc().init();
        config.barCollapsingEnabled = options.enableBarCollapsing;
        config.entersReaderIfAvailable = options.readerMode;
        self.safariVC = SFSafariViewController.alloc().initWithURLConfiguration(url, config);
      } else {
        self.safariVC = SFSafariViewController.alloc().initWithURLEntersReaderIfAvailable(
          url,
          options.readerMode
        );
      }
      self.safariVC.delegate = self;

      if (ios.MajorVersion >= 11) {
        if (options.dismissButtonStyle === 'done') {
          self.safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Done;
        }
        else if (options.dismissButtonStyle === 'close') {
          self.safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Close;
        }
        else if (options.dismissButtonStyle === 'cancel') {
          self.safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Cancel;
        }
      }

      if (ios.MajorVersion >= 10) {
        if (options.preferredBarTintColor) {
          self.safariVC.preferredBarTintColor = new Color(options.preferredBarTintColor).ios;
        }
        if (options.preferredControlTintColor) {
          self.safariVC.preferredControlTintColor = new Color(options.preferredControlTintColor).ios;
        }
      }

      const ctrl = UIApplication.sharedApplication.keyWindow.rootViewController;

      if (options.modalEnabled) {
        // This is a hack to present the SafariViewController modally
        const safariHackVC = UINavigationController.alloc().initWithRootViewController(self.safariVC);
        safariHackVC.setNavigationBarHiddenAnimated(true, false);
        safariHackVC.modalPresentationStyle = getPresentationStyle(options.modalPresentationStyle);
        if (self.animated) {
          safariHackVC.modalTransitionStyle = getTransitionStyle(options.modalTransitionStyle);
        }
        if (ios.MajorVersion >= 13) {
          safariHackVC.modalInPresentation = true;
        }
        safariHackVC.presentationController.delegate = self;

        ctrl.presentViewControllerAnimatedCompletion(safariHackVC, options.animated, null);
      }
      else {
        ctrl.presentViewControllerAnimatedCompletion(self.safariVC, options.animated, null);
      }
    });
  },
  close() {
    const self = this;
    const ctrl = UIApplication.sharedApplication.keyWindow.rootViewController;
    ctrl.dismissViewControllerAnimatedCompletion(self.animated, function () {
      if (self.redirectResolve) {
        self.redirectResolve({
          type: 'dismiss'
        });
        self.flowDidFinish();
      }
    });
  },
  async openAuth(
    authUrl: string,
    redirectUrl: string
  ): Promise<AuthSessionResult> {
    const self = this;
    if (ios.MajorVersion >= 11) {
      return new Promise<AuthSessionResult>(function (resolve, reject) {
        if (!self.initializeWebBrowser(resolve, reject)) return;

        const url = NSURL.URLWithString(authUrl);
        self.authSession = (
          ios.MajorVersion >= 12 ? ASWebAuthenticationSession : SFAuthenticationSession
        ).alloc().initWithURLCallbackURLSchemeCompletionHandler(
          url,
          redirectUrl,
          function (callbackURL, error) {
            if (!error) {
              self.redirectResolve({
                type: 'success',
                url: callbackURL.absoluteString
              });
            }
            else {
              self.redirectResolve({
                type: 'cancel'
              });
            }
            self.flowDidFinish();
          }
        );
        if(ios.MajorVersion >= 13) {
          self.authSession.presentationContextProvider = self;
        }
        self.authSession.start();
      });
    }
    else {
      self.flowDidFinish();
      const response: AuthSessionResult = {
        type: 'cancel',
        message: 'openAuth requires iOS 11 or greater'
      };
      return Promise.resolve(response);
    }
  },
  closeAuth() {
    if (ios.MajorVersion >= 11) {
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
  },
  presentationAnchorForWebAuthenticationSession: function (session: ASWebAuthenticationSession): UIWindow {
    return UIApplication.sharedApplication.keyWindow;
  },
  dismissWithoutAnimation(controller: SFSafariViewController): void {
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
  },
  safariViewControllerDidFinish(
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
  },

  flowDidFinish() {
    this.safariVC = null;
    this.redirectResolve = null;
    this.redirectReject = null;
  },
  initializeWebBrowser(resolve, reject): boolean {
    if (this.redirectResolve) {
      reject('Another InAppBrowser is already being presented.');
      return false;
    }
    this.redirectResolve = resolve;
    this.redirectReject = reject;
    return true;
  }
}, {
  protocols: protocols
});

export default InAppBrowser.new();
