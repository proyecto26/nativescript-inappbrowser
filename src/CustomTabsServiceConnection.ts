import ComponentName = android.content.ComponentName;
import CustomTabsClient = androidx.browser.customtabs.CustomTabsClient;

import { Utils } from "@nativescript/core";
import {
  setCustomTabsClient,
  CustomTabsServiceConnection,
} from "./utils.android";
import { log } from "./utils.common";

@NativeClass()
@JavaProxy("com.proyecto26.inappbrowser.CustomTabsServiceConnection")
export class InAppBrowserCustomTabsServiceConnection extends CustomTabsServiceConnection {
  constructor() {
    super();
    return global.__native(this);
  }

  onCustomTabsServiceConnected(name: ComponentName, client: CustomTabsClient) {
    setCustomTabsClient(client);
    if (!client.warmup(long(0))) {
      console.error(`Couldn't warmup custom tabs client for ${name}`);
    }
    const context = Utils.android.getApplicationContext();
    context.unbindService(this);
  }

  onServiceDisconnected(name: ComponentName) {
    setCustomTabsClient(null);
    log(`Custom tabs service disconnected for ${name}`);
  }
}
