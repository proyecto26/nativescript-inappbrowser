# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- TODO: Add new releases in the following format
## [new tag] - tag date
### Added 
for new features.
### Changed
for changes in existing functionality.
### Deprecated
for soon-to-be removed features.
### Removed
for now removed features.
### Fixed
for any bug fixes.
### Security 
in case of vulnerabilities.
-->

## [Unreleased]

## [3.1.2] - 2021-06-28

### Fixed
- Fix `README` package distribution.

## [3.1.1] - 2021-06-28

### Fixed
- Fix issues with `navigationBarColor` and `navigationBarDividerColor` Android options.

## [3.1.0] - 2021-06-27

### Added
- Add `navigationBarColor` and `navigationBarDividerColor` options by [@jdnichollsc](https://github.com/jdnichollsc).
- Add try catch block to `Safari View Controller` and `ChromeTabs` to validate the url.

### Fixed
- Fix invalid scheme with iOS 14.5.
- Fix `openAuth` crashed when going to be closed and then press the cancel button.

## [3.0.2] - 2020-02-01
### Fixed
- Fix wrong param passed to parseColor method by [@ronalson](https://github.com/ronalson) ([#56](https://github.com/proyecto26/nativescript-inappbrowser/pull/56)).

## [3.0.1] - 2020-11-30
### Fixed
- Fix colors not working with instance of Color by [@farfromrefug](https://github.com/farfromrefug) ([#50](https://github.com/proyecto26/nativescript-inappbrowser/pull/50)).

## [3.0.0] - 2020-10-30
### Added
- {N} 7 updates by [@NathanWalker](https://github.com/NathanWalker) ([#40](https://github.com/proyecto26/nativescript-inappbrowser/pull/40)).
- Added `hasBackButton` option to sets a back arrow instead of the default X icon to close the custom tab.
- Added default browser configuration for custom tab if any.
- Added `browserPackage` option to use a Package name of a browser to be used to handle Custom Tabs.
- Added `showInRecents` option to determine whether browsed website should be shown as separate entry in Android recents/multitasking view.

### Fixed
- Android `isAvailable` method checks **Custom Tab** support.
- Added a null check for `redirectResolve` in `safariViewControllerDidFinish`.
- Fixed `AppStateActiveOnce` event listener.
- Disable swipe to dismiss gesture for modal.

## [2.3.0] - 2020-04-08
### Added
- Added `ephemeralWebSession` option to supports `ephemeralWebBrowserSession` on iOS 13.
- Fix issue loading initial url from Android resume event for authentication purposes.

## [2.2.0] - 2019-11-14
### Added
- Validate if the **type** of the auth result is different to `cancel` before to check the url of the last redirection from **Android**.

## [2.1.1] - 2019-11-14
### Fixed
- Fixed issue about `headers` option not working from **Android** [#16](https://github.com/proyecto26/nativescript-inappbrowser/issues/16).

## [2.1.0] - 2019-11-13
### Added
- Added support for `automatic` modal presentation style from **iOS**.
- Added `enableBarCollapsing` option to determines whether the browser's tool bars will collapse or not from **iOS**.

### Fixed
- Fixed issue with `ASWebAuthenticationSession` to support **iOS 13** by [@cgoboncan-ebsi](https://github.com/cgoboncan-ebsi) [#14](https://github.com/proyecto26/nativescript-inappbrowser/issues/14).
- Fixed **Android** Activity issue closing the browser and restoring the state by using `onSaveInstanceState`
- Fixed Android auth redirection by using `AndroidApplication.activityResumedEvent`.

## [2.0.0] - 2019-07-27
### Added
- **Android:** Migrate to AndroidX by [@jdnichollsc](https://github.com/jdnichollsc) ([3e7ca9a](https://github.com/proyecto26/nativescript-inappbrowser/commit/3e7ca9a6f41f182a62b61435ef13c9c5fa043978)).
- Include a **CHANGELOG.md** to see the history of the changes of the project.
- Activating Open Collective and Create **CONTRIBUTING.md** to see how to contribute.
- Added `animated`, `modalPresentationStyle` and `modalTransitionStyle` properties for iOS options.
- Present the **SafariViewController** modally or as push instead using the `modalEnabled` property.
- Add workaround to dismiss **SafariViewController** without animation.

### BREAKING CHANGES

- **Android:** You are required to only use either the Support Library or AndroidX for your dependencies. If you need to migrate this library back to the support library, or another library forward to AndroidX, then take a look at the [Jetifier tool](https://github.com/mikehardy/jetifier).

## [1.0.0] - 2019-05-06
### Added
- Create `InAppBrowser for NativeScript` library inspired by [React Native InAppBrowser](https://github.com/proyecto26/react-native-inappbrowser).
- Default methods to open and close the embedded browser **(open, close)** with options.
- Methods to open and close external urls to authenticate the user **(openAuth, closeAuth)** using deep linking.
- `isAvailable` method to detect if the device supports the plugin.

[Unreleased]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v3.1.2...HEAD
[3.1.2]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v3.0.2...v3.1.0
[3.0.2]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/proyecto26/nativescript-inappbrowser/releases/tag/v1.0.0
