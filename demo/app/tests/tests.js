var application = require('tns-core-modules/application')
var utils = require('tns-core-modules/utils/utils')
var InAppBrowser = require('nativescript-inappbrowser').default

describe("isAvailable", function () {
  it("exists", function () {
    expect(InAppBrowser.isAvailable).toBeDefined()
  })

  it("supported", async function () {
    if (application.android ||
      (application.ios && utils.ios.MajorVersion >= 9)) {
      expect(await InAppBrowser.isAvailable()).toBeTruthy()
    }
    else {
      expect(await InAppBrowser.isAvailable()).toBeFalsy()
    }
  })
})

describe("open", function () {
  it("exists", function () {
    expect(InAppBrowser.open).toBeDefined()
  })
})

describe("close", function () {
  it("exists", function () {
    expect(InAppBrowser.close).toBeDefined()
  })
})

describe("openAuth", function () {
  it("exists", function () {
    expect(InAppBrowser.openAuth).toBeDefined()
  })
})

describe("closeAuth", function () {
  it("exists", function () {
    expect(InAppBrowser.closeAuth).toBeDefined()
  })
})