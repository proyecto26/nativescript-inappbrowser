export enum BROWSER_TYPES {
  CANCEL = 'cancel',
  DISMISS = 'dismiss',
  SUCCESS = 'success'
}

export type RedirectEvent = {
  url: 'string'
};

export type BrowserResult = {
  type: 'cancel' | 'dismiss'
  message?: string
};

export type RedirectResult = {
  type: 'success',
  url: string
};

export type AuthSessionResult = RedirectResult | BrowserResult;

export function getDefaultOptions(url: string, options: any) {
  return {
    ...options,
    url,
    dismissButtonStyle: options.dismissButtonStyle || 'close',
    readerMode: !!options.readerMode,
    animated: options.animated !== undefined ? options.animated : true,
    modalEnabled: options.modalEnabled !== undefined ? options.modalEnabled : true,
    enableBarCollapsing: !!options.enableBarCollapsing
  };
}
