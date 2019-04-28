import Activity = android.app.Activity;
import Context = android.content.Context;
import Intent = android.content.Intent;
import Bundle = android.os.Bundle;

import EventBus = org.greenrobot.eventbus.EventBus;

export class ChromeTabsDismissedEvent extends java.lang.Object {
  public message: String;
  public resultType: String;

  constructor (message: String, resultType: String) {
    super();

    this.message = message;
    this.resultType = resultType;
    return global.__native(this);
  }
}

// @Interfaces([org.greenrobot.eventbus.Subscribe])
@JavaProxy("org.nativescript.ChromeTabsManagerActivity")
export class ChromeTabsManagerActivity extends Activity {
  static KEY_BROWSER_INTENT = "browserIntent";
  private mOpened = false;

  public static createStartIntent(context: Context, authIntent: Intent): Intent {
    const intent = ChromeTabsManagerActivity.createBaseIntent(context);
    intent.putExtra(ChromeTabsManagerActivity.KEY_BROWSER_INTENT, authIntent);
    return intent;
  }

  public static createDismissIntent(context: Context): Intent {
    const intent = ChromeTabsManagerActivity.createBaseIntent(context);
    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
    return intent;
  }

  private static createBaseIntent(context: Context): Intent {
    return new Intent(context, ChromeTabsManagerActivity.class);
  }

  public onCreate(savedInstanceState?: Bundle): void {
    super.onCreate(savedInstanceState);

    const KEY_BROWSER_INTENT = ChromeTabsManagerActivity.KEY_BROWSER_INTENT;

    // This activity gets opened in 2 different ways. If the extra KEY_BROWSER_INTENT is present we
    // start that intent and if it is not it means this activity was started with FLAG_ACTIVITY_CLEAR_TOP
    // in order to close the intent that was started previously so we just close this.
    if (this.getIntent().hasExtra(KEY_BROWSER_INTENT)) {
      const browserIntent = <Intent>this.getIntent().getParcelableExtra(KEY_BROWSER_INTENT);
      browserIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
      this.startActivity(browserIntent);
    } else {
      this.finish();
    }
  }

  onResume(): void {
    super.onResume();

    // onResume will get called twice, the first time when the activity is created and a second
    // time if the user closes the chrome tabs activity. Knowing this we can detect if the user
    // dismissed the activity and send an event accordingly.
    if (!this.mOpened) {
      this.mOpened = true;
    } else {
      EventBus.getDefault().post(new ChromeTabsDismissedEvent("chrome tabs activity closed", "cancel"));
      this.finish();
    }
  }

  onDestroy(): void {
    EventBus.getDefault().post(new ChromeTabsDismissedEvent("chrome tabs activity destroyed", "dismiss"));
    super.onDestroy();
  }

  onNewIntent(intent: Intent): void {
    super.onNewIntent(intent);
    this.setIntent(intent);
  }
}