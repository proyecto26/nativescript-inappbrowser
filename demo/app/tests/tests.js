import { isAndroid, isIOS, Utils } from "@nativescript/core";
import { InAppBrowser } from "nativescript-inappbrowser";

describe("isAvailable", function () {
  it("exists", function () {
    expect(InAppBrowser.isAvailable).toBeDefined();
  });

  it("supported", async function () {
    if (isAndroid || (isIOS && Utils.ios.MajorVersion >= 9)) {
      expect(await InAppBrowser.isAvailable()).toBeTruthy();
    } else {
      expect(await InAppBrowser.isAvailable()).toBeFalsy();
    }
  });
});

describe("open", function () {
  it("exists", function () {
    expect(InAppBrowser.open).toBeDefined();
  });
});

describe("close", function () {
  it("exists", function () {
    expect(InAppBrowser.close).toBeDefined();
  });
});

describe("openAuth", function () {
  it("exists", function () {
    expect(InAppBrowser.openAuth).toBeDefined();
  });
});

describe("closeAuth", function () {
  it("exists", function () {
    expect(InAppBrowser.closeAuth).toBeDefined();
  });
});
