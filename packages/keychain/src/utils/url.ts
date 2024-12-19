export const PopupCenter = (
  url: string,
  title: string,
  w: number,
  h: number,
) => {
  const userAgent = navigator.userAgent,
    mobile = function () {
      return (
        /\b(iPhone|iP[ao]d)/.test(userAgent) ||
        /\b(iP[ao]d)/.test(userAgent) ||
        /Android/i.test(userAgent) ||
        /Mobile/i.test(userAgent)
      );
    },
    screenX =
      typeof window.screenX != "undefined" ? window.screenX : window.screenLeft,
    screenY =
      typeof window.screenY != "undefined" ? window.screenY : window.screenTop,
    outerWidth =
      typeof window.outerWidth != "undefined"
        ? window.outerWidth
        : document.documentElement.clientWidth,
    outerHeight =
      typeof window.outerHeight != "undefined"
        ? window.outerHeight
        : document.documentElement.clientHeight - 22,
    targetWidth = mobile() ? null : w,
    targetHeight = mobile() ? null : h,
    V = screenX < 0 ? window.screen.width + screenX : screenX,
    left = parseInt(String(V + (outerWidth - (targetWidth ?? 0)) / 2), 10),
    right = parseInt(
      String(screenY + (outerHeight - (targetHeight ?? 0)) / 2.5),
      10,
    ),
    features = [];
  if (targetWidth !== null) {
    features.push("width=" + targetWidth);
  }
  if (targetHeight !== null) {
    features.push("height=" + targetHeight);
  }
  features.push("left=" + left);
  features.push("top=" + right);
  features.push("scrollbars=1");

  const newWindow = window.open(url, title, features.join(","));

  newWindow?.focus();

  return newWindow;
};
