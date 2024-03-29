import Context = android.content.Context;
import ComponentName = android.content.ComponentName;
import CustomTabsClient = androidx.browser.customtabs.CustomTabsClient;
import Log = android.util.Log;

import { CustomTabsServiceConnection } from "./utils.android";
import { log } from "./utils.common";

@NativeClass()
class CustomTabsController extends CustomTabsServiceConnection {
  private static readonly TAG = "CustomTabsController";
  private readonly context: WeakRef<Context>;
  public static customTabsClient: CustomTabsClient;
  constructor(context: Context) {
    super();
    this.context = new WeakRef(context);

    return global.__native(this);
  }

  onCustomTabsServiceConnected(_: ComponentName, client: CustomTabsClient) {
    CustomTabsController.customTabsClient = client;
    if (!client.warmup(long(0))) {
      Log.e(CustomTabsController.TAG, "Couldn't warmup custom tabs client");
    }
    const context = this.context.get();
    context.unbindService(this);
    log("Custom tabs service connected");
  }

  onServiceDisconnected(_: ComponentName) {
    CustomTabsController.customTabsClient = null;
    log("Custom tabs service disconnected");
  }
}

export { CustomTabsController };
