export const getDeepLink = (path = "") => {
  const scheme = 'my-demo';
  const prefix = global.isAndroid ? `${scheme}://demo/` : `${scheme}://`;
  return prefix + path;
};

export const sleep = (timeout: number) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};