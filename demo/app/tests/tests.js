var InAppBrowser = require('nativescript-inappbrowser')

describe("open function", function () {
  it("render", function () {
    expect(InAppBrowser.open).toBeDefined()
  })
})