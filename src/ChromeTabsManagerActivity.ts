import Context = android.content.Context;
import Intent = android.content.Intent;
import Bundle = android.os.Bundle;

import { Observable } from '@nativescript/core';
import { BROWSER_TYPES } from './InAppBrowser.common';
import { DISMISSED_EVENT } from './utils.android';
import { log } from './utils.common';


export class ChromeTabsEvent extends Observable {
  public message: string;
  public resultType: string;
  public isError: boolean
}

export const BROWSER_ACTIVITY_EVENTS = new ChromeTabsEvent();

const KEY_BROWSER_INTENT = 'browserIntent';
const BROWSER_RESULT_TYPE = 'browserResultType';
const DEFAULT_RESULT_TYPE = BROWSER_TYPES.DISMISS;

const notifyMessage = (message: string, resultType: BROWSER_TYPES, isError = false) => {
  BROWSER_ACTIVITY_EVENTS.set('message', message);
  BROWSER_ACTIVITY_EVENTS.set('resultType', resultType);
  BROWSER_ACTIVITY_EVENTS.set('isError', isError);
  BROWSER_ACTIVITY_EVENTS.notify({
    eventName: DISMISSED_EVENT,
    object: BROWSER_ACTIVITY_EVENTS
  });
};

/**
 * Manages the custom chrome tabs intent by detecting when it is dismissed by the user and allowing
 * to close it programmatically when needed.
 */
@NativeClass()
@JavaProxy('com.proyecto26.inappbrowser.ChromeTabsManagerActivity')
export class ChromeTabsManagerActivity extends android.app.Activity {
  private mOpened = false;
  private resultType = null;
  private isError = false;

  constructor() {
    super();
    return global.__native(this);
  }

  public onCreate(savedInstanceState?: Bundle): void {
    try {
      super.onCreate(savedInstanceState);

      // This activity gets opened in 2 different ways. If the extra KEY_BROWSER_INTENT is present we
      // start that intent and if it is not it means this activity was started with FLAG_ACTIVITY_CLEAR_TOP
      // in order to close the intent that was started previously so we just close this.
      if (
        this.getIntent().hasExtra(KEY_BROWSER_INTENT)
        && (!savedInstanceState || !savedInstanceState.getString(BROWSER_RESULT_TYPE))
      ) {
        const browserIntent = <Intent>this.getIntent().getParcelableExtra(KEY_BROWSER_INTENT);
        browserIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        this.startActivity(browserIntent);
        this.resultType = DEFAULT_RESULT_TYPE;
      } else {
        this.finish();
      }
    } catch (error) {
      this.isError = true;
      notifyMessage('Unable to open url.', this.resultType, this.isError);
      this.finish();
      log(`InAppBrowser: ${error}`);
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
      this.resultType = BROWSER_TYPES.CANCEL;
      this.finish();
    }
  }

  onDestroy(): void {
    if (this.resultType) {
      switch (this.resultType) {
        case BROWSER_TYPES.CANCEL:
          notifyMessage('chrome tabs activity closed', this.resultType, this.isError);
          break;
        default:
          notifyMessage('chrome tabs activity destroyed', DEFAULT_RESULT_TYPE, this.isError);
          break;
      }
      this.resultType = null;
    }
    super.onDestroy();
  }

  onNewIntent(intent: Intent): void {
    super.onNewIntent(intent);
    this.setIntent(intent);
  }

  onRestoreInstanceState(savedInstanceState: Bundle) {
    super.onRestoreInstanceState(savedInstanceState);
    this.resultType = savedInstanceState.getString(BROWSER_RESULT_TYPE);
  }

  onSaveInstanceState(savedInstanceState: Bundle) {
    savedInstanceState.putString(BROWSER_RESULT_TYPE, DEFAULT_RESULT_TYPE);
    super.onSaveInstanceState(savedInstanceState);
  }
}

export const createStartIntent = (context: Context, authIntent: Intent): Intent => {
  let intent = createBaseIntent(context);
  intent.putExtra(KEY_BROWSER_INTENT, authIntent);
  return intent;
};

export const createDismissIntent = (context: Context): Intent => {
  let intent = createBaseIntent(context);
  intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
  return intent;
};

export const createBaseIntent = (context: Context): Intent => {
  return new Intent(context, ChromeTabsManagerActivity.class);
};