interface ASWebAuthenticationPresentationContextProviding
  extends NSObjectProtocol {
  presentationAnchorForWebAuthenticationSession(
    session: ASWebAuthenticationSession
  ): UIWindow;
}

declare var ASWebAuthenticationPresentationContextProviding: {
  prototype: ASWebAuthenticationPresentationContextProviding;
};

declare class ASWebAuthenticationSession extends NSObject {
  static alloc(): ASWebAuthenticationSession; // inherited from NSObject

  static new(): ASWebAuthenticationSession; // inherited from NSObject

  prefersEphemeralWebBrowserSession: boolean;

  presentationContextProvider: ASWebAuthenticationPresentationContextProviding;

  constructor(o: {
    URL: NSURL;
    callbackURLScheme: string;
    completionHandler: (p1: NSURL, p2: NSError) => void;
  });

  cancel(): void;

  initWithURLCallbackURLSchemeCompletionHandler(
    URL: NSURL,
    callbackURLScheme: string,
    completionHandler: (p1: NSURL, p2: NSError) => void
  ): this;

  start(): boolean;
}
