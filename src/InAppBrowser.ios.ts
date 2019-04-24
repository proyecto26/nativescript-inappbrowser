import { Color } from 'tns-core-modules/color';
import { ios } from 'tns-core-modules/utils/utils';
import { ios as iosApp } from 'tns-core-modules/application';

import {
  RedirectEvent,
  BrowserResult,
  RedirectResult,
  AuthSessionResult,
  getDefaultOptions
} from './InAppBrowser.common';

type InAppBrowserOptions = {
  dismissButtonStyle?: 'done' | 'close' | 'cancel',
  preferredBarTintColor?: string,
  preferredControlTintColor?: string,
  readerMode?: boolean
}

declare var UIApplication: any;

export class InAppBrowser extends NSObject implements SFSafariViewControllerDelegate {
  public static ObjCProtocols = [SFSafariViewControllerDelegate];
  protected static redirectResolve: any = null
  protected static redirectReject: any = null

  public static init(): InAppBrowser {
		const delegate = <InAppBrowser>InAppBrowser.new();
		return delegate;
	}

  static open(url: string, options: InAppBrowserOptions = {}): Promise<any> {

    return new Promise(function (resolve, reject) {
      if (!InAppBrowser.initializeWebBrowser(resolve, reject)) return

      const inAppBrowserOptions = getDefaultOptions(url, options);

      const safariVC = SFSafariViewController.alloc().initWithURLEntersReaderIfAvailable(
        NSURL.URLWithString(inAppBrowserOptions.url),
        options.readerMode
      );
      safariVC.delegate = InAppBrowser.init();

      if (ios.MajorVersion >= 11) {
        if (inAppBrowserOptions.dismissButtonStyle === 'done') {
          safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Done;
        }
        else if (inAppBrowserOptions.dismissButtonStyle === 'close') {
          safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Close;
        }
        else if (inAppBrowserOptions.dismissButtonStyle === 'cancel') {
          safariVC.dismissButtonStyle = SFSafariViewControllerDismissButtonStyle.Cancel;
        }
      }

      if (ios.MajorVersion >= 10) {
        if (inAppBrowserOptions.preferredBarTintColor) {
          safariVC.preferredBarTintColor = new Color(inAppBrowserOptions.preferredBarTintColor).ios;
        }
        if (inAppBrowserOptions.preferredControlTintColor) {
          safariVC.preferredControlTintColor = new Color(inAppBrowserOptions.preferredControlTintColor).ios;
        }
      }

      safariVC.modalPresentationStyle = UIModalPresentationStyle.OverFullScreen;
      const safariHackVC = UINavigationController.alloc().initWithRootViewController(safariVC);
      safariHackVC.setNavigationBarHiddenAnimated(true, false);

      const app = ios.getter(UIApplication, UIApplication.sharedApplication);

      const animated = true;
      const completionHandler = null;
      app.keyWindow.rootViewController.presentViewControllerAnimatedCompletion(safariHackVC, animated, completionHandler);
    })
  }

  safariViewControllerDidCompleteInitialLoad(controller: SFSafariViewController, didLoadSuccessfully: boolean): void {
		console.log('Delegate, safariViewControllerDidCompleteInitialLoad: ' + didLoadSuccessfully);
	}

  safariViewControllerDidFinish(controller: SFSafariViewController): void {
    InAppBrowser.redirectResolve({
      type: 'cancel'
    });
    InAppBrowser.flowDidFinish();
  }

  static flowDidFinish() {
    InAppBrowser.redirectResolve = null;
    InAppBrowser.redirectReject = null;
  }

  static initializeWebBrowser(resolve, reject): boolean {
    if (InAppBrowser.redirectResolve) {
      reject('Another InAppBrowser is already being presented.');
      return false;
    }
    InAppBrowser.redirectResolve = resolve;
    InAppBrowser.redirectReject = reject;
    return true;
  }
}

export default InAppBrowser