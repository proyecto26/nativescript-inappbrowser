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

[Unreleased]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/proyecto26/nativescript-inappbrowser/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/proyecto26/nativescript-inappbrowser/releases/tag/v1.0.0
