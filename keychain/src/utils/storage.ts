import Cookies from "js-cookie";

const isSafari =
  typeof navigator !== "undefined" &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const Storage = {
  get: (key: string): any => {
    if (!isSafari && typeof window != "undefined") {
      const value = window.localStorage.getItem(key)
      if (!value) {
        return null
      }

      return JSON.parse(value);
    }

    const existing = Cookies.get(key);

    if (typeof existing === "undefined") {
      return undefined;
    }

    return JSON.parse(existing);
  },
  set: (key: string, value: any) => {
    if (!isSafari && typeof window != "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
      return;
    }

    Cookies.set(key, JSON.stringify(value), { secure: true });
  },
  remove: (key: string) => {
    if (!isSafari && typeof window != "undefined") {
      window.localStorage.removeItem(key);
      return;
    }

    Cookies.remove(key);
  },
};

export default Storage;
