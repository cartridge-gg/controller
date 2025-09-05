import { useEffect, useState, useCallback } from "react";

export interface KeyboardState {
  isOpen: boolean;
  viewportHeight: number;
  screenHeight: number;
  keyboardHeight: number;
}

/**
 * Optimized hook to detect keyboard state and provide viewport dimensions
 * @param minKeyboardHeight - Minimum height difference to consider keyboard as open (default: 300)
 * @param debounceMs - Debounce delay for state changes (default: 100)
 * @returns KeyboardState object with keyboard status and dimensions
 */
export function useDetectKeyboardOpen(
  minKeyboardHeight = 300,
  debounceMs = 100,
): KeyboardState {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>(() => {
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
  }, [minKeyboardHeight]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

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
  }, [updateKeyboardState, debounceMs]);

  return keyboardState;
}

/**
 * Hook that provides a ref to automatically adjust container height based on keyboard state
 * @param minKeyboardHeight - Minimum height difference to consider keyboard as open
 * @returns Ref to attach to the container element
 */
export function useKeyboardAwareRef(minKeyboardHeight = 300) {
  const keyboardState = useDetectKeyboardOpen(minKeyboardHeight);

  return useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        if (keyboardState.isOpen) {
          // Set the container height to the viewport height when keyboard is open
          element.style.height = `${keyboardState.viewportHeight}px`;
          element.style.overflow = "hidden";
        } else {
          // Reset to auto height when keyboard is closed
          element.style.height = "auto";
          element.style.overflow = "";
        }
      }
    },
    [keyboardState.isOpen, keyboardState.viewportHeight],
  );
}
