const Storage = {
  keys: (): string[] | undefined => {
    if (typeof window != "undefined") {
      return Object.keys(window.localStorage);
    }
  },
  get: (key: string): any => {
    if (typeof window != "undefined") {
      const value = window.localStorage.getItem(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value);
    }
  },
  set: (key: string, value: any) => {
    if (typeof window != "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
      return;
    }
  },
  update: (key: string, value: any) => {
    const existing = Storage.get(key);
    if (existing) {
      return Storage.set(key, { ...existing, ...value });
    }
    Storage.set(key, value);
  },
  remove: (key: string) => {
    if (typeof window != "undefined") {
      window.localStorage.removeItem(key);
      return;
    }
  },
  clear: () => {
    if (typeof window != "undefined") {
      window.localStorage.clear();
      return;
    }
  },
};

export default Storage;
