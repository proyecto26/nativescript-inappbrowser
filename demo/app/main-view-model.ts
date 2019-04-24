import { Observable } from 'tns-core-modules/data/observable';
import { alert } from "tns-core-modules/ui/dialogs"
import InAppBrowser from 'nativescript-inappbrowser';

export class HelloWorldModel extends Observable {
  private _url: string;

  constructor() {
    super();

    // Initialize default values.
    this._url = 'https://www.google.com';
  }

  openLink = async () => {
    try{
      const response = await InAppBrowser.open(this.url)
      alert({
        title: 'Response',
        message: JSON.stringify(response),
        okButtonText: 'Ok'
      })
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
    return this._url;
  }

  set url(value: string) {
    if (this._url !== value) {
      this._url = value;
      this.notifyPropertyChange("url", value);
    }
  }
}
