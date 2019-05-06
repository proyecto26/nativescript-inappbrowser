<p align="center">
  <h1 align="center">InAppBrowser for NativeScript</h1>
</p>

<p align="center">
  <img width="400px" src="img/inappbrowser.png">
</p>

## Getting started

```javascript
tns plugin add nativescript-inappbrowser
```

## Usage

Methods       | Action
------------- | ------
`open`        | Opens the url with Safari in a modal on iOS using **SFSafariViewController**, and Chrome in a new custom tab on Android. On iOS, the modal Safari will not share cookies with the system Safari.
`close`       | Dismisses the system's presented web browser
`openAuth`    | Opens the url with Safari in a modal on iOS using **SFAuthenticationSession**, and Chrome in a new custom tab on Android. On iOS, the user will be asked whether to allow the app to authenticate using the given url.
`closeAuth`   | Dismisses the current authentication session
`isAvailable` | Detect if the device supports this plugin

### iOS Options

Property       | Description
-------------- | ------
`dismissButtonStyle` (String)        | The style of the dismiss button. [`done`/`close`/`cancel`]
`preferredBarTintColor` (String)     | The color to tint the background of the navigation bar and the toolbar. [`white`/`#FFFFFF`]
`preferredControlTintColor` (String) | The color to tint the control buttons on the navigation bar and the toolbar. [`gray`/`#808080`]
`readerMode` (Boolean)               | A value that specifies whether Safari should enter Reader mode, if it is available. [`true`/`false`]

### Android Options
Property       | Description
-------------- | ------
`showTitle` (Boolean)   | Sets whether the title should be shown in the custom tab. [`true`/`false`]
`toolbarColor` (String)           | Sets the toolbar color. [`gray`/`#808080`]
`secondaryToolbarColor` (String)  | Sets the color of the secondary toolbar. [`white`/`#FFFFFF`]
`enableUrlBarHiding` (Boolean)    | Enables the url bar to hide as the user scrolls down on the page. [`true`/`false`]
`enableDefaultShare` (Boolean)    | Adds a default share item to the menu. [`true`/`false`]
`animations` (Object)             | Sets the start and exit animations. [`{ startEnter, startExit, endEnter, endExit }`]
`headers` (Object)                | The data are key/value pairs, they will be sent in the HTTP request headers for the provided url. [`{ 'Authorization': 'Bearer ...' }`]

### Demo

```javascript
import { openUrl } from 'tns-core-modules/utils/utils'
import { alert } from 'tns-core-modules/ui/dialogs'
import InAppBrowser from 'nativescript-inappbrowser'

...
  openLink = async () => {
    try {
      const url = 'https://www.google.com'
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
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
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
...
```

## Contributors ✨
Thanks goes to these wonderful people:
<!-- CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img alt="jdnichollsc" src="https://avatars3.githubusercontent.com/u/2154886?v=3" width="100" /><br /><sub><b>Juan Nicholls</b></sub>](https://github.com/jdnichollsc)<br />[✉](mailto:jdnichollsc@hotmail.com) | [<img alt="NathanaelA" src="https://avatars3.githubusercontent.com/u/850871?v=3" width="100" /><br /><sub><b>Nathanael Anderson</b></sub>](https://github.com/NathanaelA)<br />[✉](mailto:nathan@master-technology.com) |
| :---: | :---: |
<!-- CONTRIBUTORS-LIST:END -->
    
## Supporting 🍻
I believe in Unicorns 🦄
Support [me](http://www.paypal.me/jdnichollsc/2), if you do too.

## Happy coding 💯
Made with ❤️

<img width="150px" src="https://avatars0.githubusercontent.com/u/28855608?s=200&v=4" align="right">
