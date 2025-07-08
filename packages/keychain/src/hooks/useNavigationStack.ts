import { useCallback, useEffect, useState } from "react";
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
      // Don't add to stack if disabled
      if (disabled) return;

      const stack = getCurrentStack();

      // Don't add duplicate consecutive entries
      const lastEntry = stack[stack.length - 1];
      if (
        lastEntry &&
        lastEntry.path === entry.path &&
        lastEntry.search === entry.search &&
        lastEntry.hash === entry.hash
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
    },
    [stackKey, maxStackSize, getCurrentStack, disabled],
  );

  // Remove last entry from stack
  const removeFromStack = useCallback(() => {
    const stack = getCurrentStack();
    if (stack.length > 0) {
      stack.pop();
      navigationStacks.set(stackKey, stack);
      setStackDepth(stack.length);
    }
  }, [stackKey, getCurrentStack]);

  // Track location changes and update stack
  useEffect(() => {
    const currentEntry: NavigationStackEntry = {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      timestamp: Date.now(),
    };

    addToStack(currentEntry);
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
      // Remove current entry
      removeFromStack();

      // Get previous entry
      const updatedStack = getCurrentStack();
      const previousEntry = updatedStack[updatedStack.length - 1];

      if (previousEntry) {
        const fullPath = `${previousEntry.path}${previousEntry.search}${previousEntry.hash}`;
        navigate(fullPath, { replace: true });
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
    navigate("/", { replace: true });
  }, [stackKey, navigate]);

  const getStackDepth = useCallback(() => {
    return getCurrentStack().length;
  }, [getCurrentStack]);

  const canGoBack = useCallback(() => {
    return getCurrentStack().length > 1;
  }, [getCurrentStack]);

  const navigateWithStack = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        navigate(path, { replace: true });
      } else {
        navigate(path);
      }
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
