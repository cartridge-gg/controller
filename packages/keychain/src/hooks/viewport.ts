import {
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
import { useDevice } from "./device";

export interface KeyboardState {
  isOpen: boolean;
  viewportHeight: number;
  screenHeight: number;
  keyboardHeight: number;
}

const isKeyboardInput = (elem: HTMLElement) =>
  (elem.tagName === "INPUT" &&
    !["button", "submit", "checkbox", "file", "image"].includes(
      (elem as HTMLInputElement).type,
    )) ||
  elem.hasAttribute("contenteditable");

/**
 * Hook to detect keyboard state and provide viewport dimensions
 * @param minKeyboardHeight - Minimum height difference to consider keyboard as open (default: 300)
 * @param debounceMs - Debounce delay for state changes (default: 100)
 * @returns KeyboardState object with keyboard status and dimensions
 */
export function useDetectKeyboardOpen(
  minKeyboardHeight = 300,
  debounceMs = 100,
): KeyboardState {
  const { isMobile } = useDevice();

  const [keyboardState, setKeyboardState] = useState<KeyboardState>(() => {
    if (!isMobile) {
      return {
        isOpen: false,
        viewportHeight: window.innerHeight,
        screenHeight: window.screen.height,
        keyboardHeight: 0,
      };
    }

    const screenHeight = window.screen.height;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const keyboardHeight = Math.max(0, screenHeight - viewportHeight);
    const isOpen = keyboardHeight > minKeyboardHeight;

    return {
      isOpen,
      viewportHeight,
      screenHeight,
      keyboardHeight,
    };
  });

  const updateKeyboardState = useCallback(() => {
    if (!isMobile) {
      return;
    }

    const screenHeight = window.screen.height;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const keyboardHeight = Math.max(0, screenHeight - viewportHeight);
    const isOpen = keyboardHeight > minKeyboardHeight;

    setKeyboardState((prevState) => {
      // Only update if there's a meaningful change to avoid unnecessary re-renders
      if (
        prevState.isOpen !== isOpen ||
        Math.abs(prevState.viewportHeight - viewportHeight) > 10 ||
        Math.abs(prevState.keyboardHeight - keyboardHeight) > 10
      ) {
        return {
          isOpen,
          viewportHeight,
          screenHeight,
          keyboardHeight,
        };
      }
      return prevState;
    });
  }, [minKeyboardHeight, isMobile]);

  // Support for focus events to detect keyboard on iOS Safari
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if (!isMobile) {
        return;
      }

      if (!e.target) {
        return;
      }
      const target = e.target as HTMLElement;
      if (isKeyboardInput(target)) {
        setKeyboardState((st) => ({ ...st, isOpen: true }));
      }
    };
    document.addEventListener("focusin", handleFocusIn);
    const handleFocusOut = (e: FocusEvent) => {
      if (!isMobile) {
        return;
      }

      if (!e.target) {
        return;
      }
      const target = e.target as HTMLElement;
      if (isKeyboardInput(target)) {
        setKeyboardState((st) => ({ ...st, isOpen: false }));
      }
    };
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, [isMobile]);

  useLayoutEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isMobile) {
      return;
    }

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateKeyboardState, debounceMs);
    };

    // Check if visual viewport API is supported
    if (typeof window.visualViewport !== "undefined" && window.visualViewport) {
      const visualViewport = window.visualViewport;

      // Listen to resize events on visual viewport
      visualViewport.addEventListener("resize", debouncedUpdate);

      // Also listen to scroll events as they can indicate keyboard changes
      visualViewport.addEventListener("scroll", debouncedUpdate);

      return () => {
        clearTimeout(timeoutId);
        visualViewport.removeEventListener("resize", debouncedUpdate);
        visualViewport.removeEventListener("scroll", debouncedUpdate);
      };
    } else {
      // Fallback for browsers without visual viewport support
      window.addEventListener("resize", debouncedUpdate);
      window.addEventListener("orientationchange", debouncedUpdate);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", debouncedUpdate);
        window.removeEventListener("orientationchange", debouncedUpdate);
      };
    }
  }, [updateKeyboardState, debounceMs, isMobile]);

  return keyboardState;
}

// On iOS in the browser you can pull on elements down / make the page bounce
// similar to pull to refresh. This causes weird behavior when trying to
// simulate a full screen app.
// This is a partial fix for edge cases where this is still possible (e.g. on
// iOS 15 when hiding the button bar via the Aa button on the address bar). Most
// regular cases are fixed properly by ensuring the page content height isn't
// larger than the viewport.
export const usePreventOverScrolling = <T extends HTMLElement>() => {
  const container = useRef<T>(null);
  useEffect(() => {
    const elem = container.current;
    if (!elem) {
      return;
    }

    let startTouch: Touch | undefined = undefined;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        return;
      }
      startTouch = e.touches[0];
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !startTouch) {
        return;
      }

      const deltaY = startTouch.pageY - e.targetTouches[0].pageY;
      const deltaX = startTouch.pageX - e.targetTouches[0].pageX;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal scroll probably
        return;
      }

      const target = e.target as HTMLElement;
      const nearestScrollContainer = findNearestScrollContainer(target);
      if (!nearestScrollContainer) {
        console.log("Preventing scroll: no nearest scroll container");
        e.preventDefault();
        return;
      }

      const isScrollingUp = deltaY < 0;
      const isAtTop = nearestScrollContainer.scrollTop === 0;
      if (isScrollingUp && isAtTop) {
        console.log(
          "Preventing scroll: already at top of nearest scroll container",
        );
        e.preventDefault();
        return;
      }
      const isAtBottom =
        nearestScrollContainer.scrollTop ===
        nearestScrollContainer.scrollHeight -
          nearestScrollContainer.clientHeight;
      if (!isScrollingUp && isAtBottom) {
        console.log(
          "Preventing scroll: already at bottom of nearest scroll container",
        );
        e.preventDefault();
        return;
      }
    };

    elem.addEventListener("touchstart", handleTouchStart);
    elem.addEventListener("touchmove", handleTouchMove);
    return () => {
      elem.removeEventListener("touchstart", handleTouchStart);
      elem.removeEventListener("touchmove", handleTouchMove);
    };
  }, [container]);

  return container;
};

const findNearestScrollContainer = (
  elem: HTMLElement,
): HTMLElement | undefined => {
  if (elem.scrollHeight > elem.offsetHeight) {
    return elem;
  }

  const parent = elem.parentElement;
  if (!parent) {
    return undefined;
  }

  return findNearestScrollContainer(parent);
};

export default findNearestScrollContainer;
