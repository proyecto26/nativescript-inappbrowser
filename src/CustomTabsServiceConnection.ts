import Context = android.content.Context;
import ComponentName = android.content.ComponentName;
import CustomTabsClient = androidx.browser.customtabs.CustomTabsClient;

import { Utils } from "@nativescript/core";
import {
  setCustomTabsClient,
  CustomTabsServiceConnection,
} from "./utils.android";
import { log } from "./utils.common";

@NativeClass()
class CustomTabsController extends CustomTabsServiceConnection {
  private readonly context: WeakRef<Context>;
  constructor(context: Context) {
    super();
    this.context = new WeakRef(context);

    return global.__native(this);
  }

  onCustomTabsServiceConnected(name: ComponentName, client: CustomTabsClient) {
    setCustomTabsClient(client);
    if (!client.warmup(long(0))) {
      console.error(`Couldn't warmup custom tabs client for ${name.getClassName()}`);
    }
    const context = this.context.get();
    context.unbindService(this);
  }

  onServiceDisconnected(name: ComponentName) {
    setCustomTabsClient(null);
    log(`Custom tabs service disconnected for ${name.getClassName()}`);
  }
}

export { CustomTabsController }