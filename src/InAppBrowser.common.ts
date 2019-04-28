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

export function getDefaultOptions(url, options) {
  return {
    ...options,
    url,
    dismissButtonStyle: options.dismissButtonStyle || 'close',
    readerMode: options.readerMode !== undefined ? options.readerMode : false
  };
}