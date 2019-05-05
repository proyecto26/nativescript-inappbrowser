var InAppBrowser = require('nativescript-inappbrowser').default

describe("open function", function () {
  it("exist", function () {
    expect(InAppBrowser.open).toBeDefined()
  })
})

describe("close function", function () {
  it("exist", function () {
    expect(InAppBrowser.close).toBeDefined()
  })
})

describe("openAuth function", function () {
  it("exist", function () {
    expect(InAppBrowser.openAuth).toBeDefined()
  })
})

describe("closeAuth function", function () {
  it("exist", function () {
    expect(InAppBrowser.closeAuth).toBeDefined()
  })
})