import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface NavigationStackEntry {
  path: string;
  search: string;
  hash: string;
  timestamp: number;
}

export interface UseNavigationStackOptions {
  stackKey?: string;
  onClose?: () => void;
  customBackHandler?: () => void;
  maxStackSize?: number;
  disabled?: boolean; // If true, don't add entries to the navigation stack
}

// Global navigation stacks for different contexts
const navigationStacks = new Map<string, NavigationStackEntry[]>();

export function useNavigationStack(options: UseNavigationStackOptions = {}) {
  const {
    stackKey = "default",
    onClose,
    customBackHandler,
    maxStackSize = 50,
    disabled = false,
  } = options;
  const navigate = useNavigate();
  const location = useLocation();
  const [stackDepth, setStackDepth] = useState(0);
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<string>("");
  const isNavigatingRef = useRef(false);

  // Initialize stack if it doesn't exist
  if (!navigationStacks.has(stackKey)) {
    navigationStacks.set(stackKey, []);
  }

  // Get current stack
  const getCurrentStack = useCallback(() => {
    return navigationStacks.get(stackKey) || [];
  }, [stackKey]);

  // Add entry to stack
  const addToStack = useCallback(
    (entry: NavigationStackEntry) => {
      // Don't add to stack if disabled or currently navigating programmatically
      if (disabled || isNavigatingRef.current) return;

      const stack = getCurrentStack();

      // Improved duplicate detection - consider both path and timing
      const lastEntry = stack[stack.length - 1];
      const currentLocationString = `${entry.path}${entry.search}${entry.hash}`;

      // Don't add if it's the same location and was added recently (within 100ms)
      if (
        lastEntry &&
        lastEntry.path === entry.path &&
        lastEntry.search === entry.search &&
        lastEntry.hash === entry.hash &&
        entry.timestamp - lastEntry.timestamp < 100
      ) {
        return;
      }

      // Add new entry
      stack.push(entry);

      // Trim stack if it exceeds max size
      if (stack.length > maxStackSize) {
        stack.splice(0, stack.length - maxStackSize);
      }

      navigationStacks.set(stackKey, stack);
      setStackDepth(stack.length);

      if (import.meta.env.DEV) {
        console.log(
          `[NavigationStack] Added entry:`,
          entry.path,
          `Stack depth: ${stack.length}`,
        );
      }
    },
    [stackKey, maxStackSize, getCurrentStack, disabled],
  );

  // Remove last entry from stack
  const removeFromStack = useCallback(() => {
    const stack = getCurrentStack();
    if (stack.length > 0) {
      const removed = stack.pop();
      navigationStacks.set(stackKey, stack);
      setStackDepth(stack.length);

      if (import.meta.env.DEV) {
        console.log(
          `[NavigationStack] Removed entry:`,
          removed?.path,
          `Stack depth: ${stack.length}`,
        );
      }
    }
  }, [stackKey, getCurrentStack]);

  // Track location changes and update stack with debouncing
  useEffect(() => {
    const currentLocationString = `${location.pathname}${location.search}${location.hash}`;

    // Skip if this is the same location as last time
    if (lastLocationRef.current === currentLocationString) {
      return;
    }

    lastLocationRef.current = currentLocationString;

    // Clear any pending timeout
    if (locationUpdateTimeoutRef.current) {
      clearTimeout(locationUpdateTimeoutRef.current);
    }

    // Debounce location updates to prevent rapid firing during navigation
    locationUpdateTimeoutRef.current = setTimeout(() => {
      // Double-check we're not in the middle of programmatic navigation
      if (!isNavigatingRef.current) {
        const currentEntry: NavigationStackEntry = {
          path: location.pathname,
          search: location.search,
          hash: location.hash,
          timestamp: Date.now(),
        };

        addToStack(currentEntry);
      }
    }, 50); // 50ms debounce

    // Cleanup function
    return () => {
      if (locationUpdateTimeoutRef.current) {
        clearTimeout(locationUpdateTimeoutRef.current);
      }
    };
  }, [location.pathname, location.search, location.hash, addToStack]);

  // Initialize stack depth on mount
  useEffect(() => {
    const stack = getCurrentStack();
    setStackDepth(stack.length);
  }, [getCurrentStack]);

  const goBack = useCallback(() => {
    if (customBackHandler) {
      customBackHandler();
      return;
    }

    const stack = getCurrentStack();

    if (stack.length > 1) {
      // Set flag to prevent stack updates during navigation
      isNavigatingRef.current = true;

      // Remove current entry
      removeFromStack();

      // Get previous entry
      const updatedStack = getCurrentStack();
      const previousEntry = updatedStack[updatedStack.length - 1];

      if (previousEntry) {
        const fullPath = `${previousEntry.path}${previousEntry.search}${previousEntry.hash}`;

        if (import.meta.env.DEV) {
          console.log(`[NavigationStack] Going back to:`, fullPath);
        }

        // Use regular navigation instead of replace to ensure proper re-rendering
        navigate(fullPath);

        // Reset flag after a short delay to allow navigation to complete
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      } else {
        isNavigatingRef.current = false;
      }
    } else {
      // No previous entry, call onClose if available and clear stack
      if (onClose) {
        clearStack(); // Clear stack before closing
        onClose();
      } else {
        // Fallback to browser back
        navigate(-1);
      }
    }
  }, [customBackHandler, getCurrentStack, removeFromStack, navigate, onClose]);

  const clearStack = useCallback(() => {
    navigationStacks.set(stackKey, []);
    setStackDepth(0);
    isNavigatingRef.current = true;
    navigate("/", { replace: true });
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [stackKey, navigate]);

  const getStackDepth = useCallback(() => {
    return getCurrentStack().length;
  }, [getCurrentStack]);

  const canGoBack = useCallback(() => {
    return getCurrentStack().length > 1;
  }, [getCurrentStack]);

  const navigateWithStack = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      isNavigatingRef.current = true;
      if (options?.replace) {
        navigate(path, { replace: true });
      } else {
        navigate(path);
      }
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    },
    [navigate],
  );

  // Enhanced close handler that clears stack
  const handleClose = useCallback(() => {
    clearStack(); // Always clear stack when closing
    if (onClose) {
      onClose();
    }
  }, [clearStack, onClose]);

  // Reset stack when component unmounts (optional)
  const resetStack = useCallback(() => {
    clearStack();
  }, [clearStack]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (locationUpdateTimeoutRef.current) {
        clearTimeout(locationUpdateTimeoutRef.current);
      }
    };
  }, []);

  return {
    goBack,
    clearStack,
    resetStack,
    getStackDepth,
    canGoBack,
    getCurrentStack,
    navigateWithStack,
    handleClose, // Export the enhanced close handler
    stackDepth,
    canNavigateBack: canGoBack(),
  };
}
