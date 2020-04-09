import { Observable } from 'tns-core-modules/data/observable';
import { openUrl } from 'tns-core-modules/utils/utils';
import { alert } from 'tns-core-modules/ui/dialogs';
import InAppBrowser from 'nativescript-inappbrowser';
import { getDeepLink, sleep } from './utilities';

export class HelloWorldModel extends Observable {
  private _url: string;

  constructor() {
    super();

    // Initialize default values.
    this._url = 'https://www.google.com';
  }

  get url(): string {
    return this._url;
  }

  set url(value: string) {
    if (this._url !== value) {
      this._url = value;
      this.notifyPropertyChange('url', value);
    }
  }

  async openLink() {
    try {
      const { url } = this;
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: '#453AA4',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'partialCurl',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: '#6200EE',
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: true,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'my-custom-header': 'my custom header value'
          }
        });
        await sleep(800);
        alert({
          title: 'Response',
          message: JSON.stringify(result),
          okButtonText: 'Ok'
        });
      }
      else {
        openUrl(url);
      }
    }
    catch (error) {
      alert({
        title: 'Error',
        message: error.message,
        okButtonText: 'Ok'
      });
    }
  }

  async tryDeepLinking() {
    const loginUrl = `https://proyecto26.github.io/react-native-inappbrowser`;
    const redirectUrl = getDeepLink('home');
    const url = `${loginUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`;
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(url, redirectUrl, {
          // iOS Properties
          ephemeralWebSession: true,
          // Android Properties
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: true
        });
        await sleep(800);
        alert({
          title: 'Response',
          message: JSON.stringify(result),
          okButtonText: 'Ok'
        });
      }
    } catch {
      alert('Something’s wrong with the app :(');
    }
  }
}
