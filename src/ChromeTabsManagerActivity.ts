import Activity = android.app.Activity;
import Context = android.content.Context;
import Intent = android.content.Intent;
import Bundle = android.os.Bundle;

import { Observable } from 'tns-core-modules/data/observable';
// import { android as androidApp } from 'tns-core-modules/application';

export class ChromeTabsEvent extends Observable {
  public message: String;
  public resultType: String;
}

export const BROWSER_ACTIVITY_EVENTS = new ChromeTabsEvent();

const KEY_BROWSER_INTENT = 'browserIntent';

/**
 * Manages the custom chrome tabs intent by detecting when it is dismissed by the user and allowing
 * to close it programmatically when needed.
 */
@JavaProxy('com.proyecto26.inappbrowser.ChromeTabsManagerActivity')
export class ChromeTabsManagerActivity extends android.app.Activity {
  private mOpened = false;

  constructor() {
    super();
    return global.__native(this);
  }

  public onCreate(savedInstanceState?: Bundle): void {
    super.onCreate(savedInstanceState);

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
      BROWSER_ACTIVITY_EVENTS.set('message', 'chrome tabs activity closed');
      BROWSER_ACTIVITY_EVENTS.set('resultType', 'cancel');
      BROWSER_ACTIVITY_EVENTS.notify({
        eventName: 'DismissedEvent',
        object: BROWSER_ACTIVITY_EVENTS
      });
      this.finish();
    }
  }

  onDestroy(): void {
    BROWSER_ACTIVITY_EVENTS.set('message', 'chrome tabs activity destroyed');
    BROWSER_ACTIVITY_EVENTS.set('resultType', 'dismiss');
    BROWSER_ACTIVITY_EVENTS.notify({
      eventName: 'DismissedEvent',
      object: BROWSER_ACTIVITY_EVENTS
    });
    super.onDestroy();
  }

  onNewIntent(intent: Intent): void {
    super.onNewIntent(intent);
    this.setIntent(intent);
  }
}

export const createStartIntent = (context: Context, authIntent: Intent): Intent => {
  let intent = createBaseIntent(context);
  intent.putExtra(KEY_BROWSER_INTENT, authIntent);
  return intent;
}

export const createDismissIntent = (context: Context): Intent => {
  let intent = createBaseIntent(context);
  intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
  return intent;
}

export const createBaseIntent = (context: Context): Intent => {
  return new Intent(context, ChromeTabsManagerActivity.class);
}