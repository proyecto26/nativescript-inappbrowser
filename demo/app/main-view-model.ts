import { Observable } from 'tns-core-modules/data/observable'
import { openUrl } from 'tns-core-modules/utils/utils'
import { alert } from 'tns-core-modules/ui/dialogs'
import InAppBrowser from 'nativescript-inappbrowser'

export class HelloWorldModel extends Observable {
  private _url: string

  constructor() {
    super()

    // Initialize default values.
    this._url = 'https://www.google.com'
  }

  openLink = async () => {
    try {
      const { url } = this
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: 'gray',
          preferredControlTintColor: 'white',
          readerMode: false,
          // Android Properties
          showTitle: true,
          toolbarColor: '#6200EE',
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_right',
            endExit: 'slide_out_left',
          },
          headers: {
            'my-custom-header': 'my custom header value'
          }
        })
        alert({
          title: 'Response',
          message: JSON.stringify(result),
          okButtonText: 'Ok'
        })
      }
      else {
        openUrl(url);
      }
    }
    catch(error) {
      alert({
        title: 'Error',
        message: error.message,
        okButtonText: 'Ok'
      })
    }
  }

  get url(): string {
    return this._url
  }

  set url(value: string) {
    if (this._url !== value) {
      this._url = value
      this.notifyPropertyChange('url', value)
    }
  }
}
