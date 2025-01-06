declare global {
  interface IntersectionObserverInit {
    trackVisibility?: boolean;
    delay?: number;
  }

  interface IntersectionObserverEntry {
    readonly isVisible?: boolean;
  }
}

export {};
