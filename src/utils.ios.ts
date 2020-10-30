import { Utils } from '@nativescript/core';

const presentationStyles = {
  none: UIModalPresentationStyle.None,
  fullScreen: UIModalPresentationStyle.FullScreen,
  pageSheet: UIModalPresentationStyle.PageSheet,
  formSheet: UIModalPresentationStyle.FormSheet,
  currentContext: UIModalPresentationStyle.CurrentContext,
  custom: UIModalPresentationStyle.Custom,
  overFullScreen: UIModalPresentationStyle.OverFullScreen,
  overCurrentContext: UIModalPresentationStyle.OverCurrentContext,
  popover: UIModalPresentationStyle.Popover
};
const defaultModalPresentationStyle = Utils.ios.MajorVersion >= 13 ?
  UIModalPresentationStyle.Automatic : UIModalPresentationStyle.FullScreen;
const transitionStyles = {
  coverVertical: UIModalTransitionStyle.CoverVertical,
  flipHorizontal: UIModalTransitionStyle.FlipHorizontal,
  crossDissolve: UIModalTransitionStyle.CrossDissolve,
  partialCurl: UIModalTransitionStyle.PartialCurl
};
const animationKey = 'dismissInAppBrowser';
export const setModalInPresentation = 'setModalInPresentation';
export const InAppBrowserOpenAuthErrorMessage = 'openAuth requires iOS 11 or greater';

export function getPresentationStyle (styleKey: string): UIModalPresentationStyle {
  return presentationStyles[styleKey] !== undefined
    ? presentationStyles[styleKey]
    : defaultModalPresentationStyle;
};

export function getTransitionStyle (styleKey: string): UIModalTransitionStyle {
  return transitionStyles[styleKey] !== undefined ? transitionStyles[styleKey] : UIModalTransitionStyle.CoverVertical;
};

export function dismissWithoutAnimation(controller: SFSafariViewController): void {
  const transition = CATransition.animation();
  transition.duration = 0;
  transition.timingFunction = CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
  transition.type = kCATransitionFade;
  transition.subtype = kCATransitionFromBottom;

  controller.view.alpha = 0.05;
  controller.view.frame = CGRectMake(0.0, 0.0, 0.5, 0.5);

  const ctrl = UIApplication.sharedApplication.keyWindow.rootViewController;
  ctrl.view.layer.addAnimationForKey(transition, animationKey);
  ctrl.dismissViewControllerAnimatedCompletion(false, () => {
    ctrl.view.layer.removeAnimationForKey(animationKey);
  });
}