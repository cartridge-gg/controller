import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Type for navigation entry
interface NavigationEntry {
  path: string;
  state?: unknown;
  timestamp: number;
}

interface NavigationContextType {
  canGoBack: boolean;
  canGoForward: boolean;
  navigationDepth: number;
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown; resetStack?: boolean },
  ) => void;
  navigateToRoot: () => void;
  goBack: () => void;
  goForward: () => void;
  currentPath: string;
  history: NavigationEntry[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation stack and current position
  const [navigationStack, setNavigationStack] = useState<NavigationEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isInternalNavigation = useRef(false);
  const lastTrackedPath = useRef<string>("");
  const isInitialized = useRef(false);

  // Get full path including search params
  const getFullPath = useCallback(() => {
    return location.pathname + location.search;
  }, [location.pathname, location.search]);

  // Navigate to root and clear navigation state
  const navigateToRoot = useCallback(() => {
    const rootEntry: NavigationEntry = {
      path: "/",
      state: {},
      timestamp: Date.now(),
    };

    setNavigationStack([rootEntry]);
    setCurrentIndex(0);
    lastTrackedPath.current = "/";

    navigate("/", { replace: true });
  }, [navigate]);

  // Initialize with current location
  useEffect(() => {
    if (!isInitialized.current) {
      const currentPath = getFullPath();
      const initialEntry: NavigationEntry = {
        path: currentPath,
        state: location.state,
        timestamp: Date.now(),
      };
      setNavigationStack([initialEntry]);
      setCurrentIndex(0);
      lastTrackedPath.current = currentPath;
      isInitialized.current = true;
    }
  }, [getFullPath, location.state]);

  // Track location changes - fixed to avoid infinite loop
  useEffect(() => {
    // Skip if not initialized
    if (!isInitialized.current) return;

    const currentPath = getFullPath();
    const currentPathname = location.pathname;

    // Skip if this is an internal navigation (back/forward)
    if (isInternalNavigation.current) {
      isInternalNavigation.current = false;
      lastTrackedPath.current = currentPath;
      return;
    }

    // Skip if the pathname hasn't actually changed (ignore search params for stack entries)
    const previousPathname = lastTrackedPath.current.split("?")[0];
    if (currentPathname === previousPathname) {
      // Update the lastTrackedPath to include new search params but don't add to stack
      lastTrackedPath.current = currentPath;
      return;
    }

    const newEntry: NavigationEntry = {
      path: currentPath,
      state: location.state,
      timestamp: Date.now(),
    };

    // Update both stack and index together to ensure consistency
    setNavigationStack((prev) => {
      // Find where we currently are in the stack (compare only pathname)
      let currentPosition = prev.length - 1;
      for (let i = prev.length - 1; i >= 0; i--) {
        const stackPathname = prev[i].path.split("?")[0];
        if (stackPathname === previousPathname) {
          currentPosition = i;
          break;
        }
      }

      // Truncate any forward history and add new entry
      const newStack = [...prev.slice(0, currentPosition + 1), newEntry];

      // Update the index to point to the new entry
      const newIndex = newStack.length - 1;
      setCurrentIndex(newIndex);

      return newStack;
    });

    lastTrackedPath.current = currentPath;
  }, [getFullPath, location.state, location.pathname]);

  // Handle controller navigation events
  useEffect(() => {
    const handleControllerNavigate = (event: Event) => {
      const navEvent = event as CustomEvent<{
        path: string;
        state?: unknown;
        options?: { resetStack?: boolean };
      }>;
      const { path, state, options } = navEvent.detail;
      const resetStack = options?.resetStack ?? true;

      if (resetStack) {
        // For controller navigation, we typically want to start fresh
        const entry: NavigationEntry = {
          path,
          state,
          timestamp: Date.now(),
        };

        setNavigationStack([entry]);
        setCurrentIndex(0);
        lastTrackedPath.current = path;
        isInternalNavigation.current = true; // Prevent double tracking

        navigate(path, { replace: true, state });
      } else {
        navigate(path, { state });
      }
    };

    window.addEventListener("controller-navigate", handleControllerNavigate);

    return () => {
      window.removeEventListener(
        "controller-navigate",
        handleControllerNavigate,
      );
    };
  }, [navigate]);

  // Navigate with tracking
  const navigateWithTracking = useCallback(
    (
      to: string | number,
      options?: { replace?: boolean; state?: unknown; resetStack?: boolean },
    ) => {
      if (typeof to === "number") {
        // Handle relative navigation
        const newIndex = currentIndex + to;

        if (newIndex >= 0 && newIndex < navigationStack.length) {
          isInternalNavigation.current = true;
          setCurrentIndex(newIndex);
          const entry = navigationStack[newIndex];
          lastTrackedPath.current = entry.path;
          navigate(entry.path, { state: entry.state });
        }
      } else {
        // Handle resetStack option - reset navigation stack to just this path
        if (options?.resetStack) {
          const entry: NavigationEntry = {
            path: to,
            state: options.state,
            timestamp: Date.now(),
          };

          setNavigationStack([entry]);
          setCurrentIndex(0);
          lastTrackedPath.current = to;
          isInternalNavigation.current = true; // Prevent double tracking

          navigate(to, { replace: true, state: options.state });
          return;
        }

        // For replace navigation, update current entry
        if (options?.replace) {
          setNavigationStack((prev) => {
            const newStack = [...prev];
            if (newStack[currentIndex]) {
              newStack[currentIndex] = {
                path: to,
                state: options.state,
                timestamp: Date.now(),
              };
            }
            return newStack;
          });
          lastTrackedPath.current = to;
        }

        navigate(to, options);
      }
    },
    [navigate, currentIndex, navigationStack],
  );

  // Go back helper
  const goBack = useCallback(() => {
    navigateWithTracking(-1);
  }, [navigateWithTracking]);

  // Go forward helper
  const goForward = useCallback(() => {
    navigateWithTracking(1);
  }, [navigateWithTracking]);

  // Expose method to reset navigation (useful for external calls)
  useEffect(() => {
    (window as Window & { __resetNavigation?: () => void }).__resetNavigation =
      () => {
        navigateToRoot();
      };

    return () => {
      delete (window as Window & { __resetNavigation?: () => void })
        .__resetNavigation;
    };
  }, [navigateToRoot]);

  const value: NavigationContextType = {
    canGoBack: currentIndex > 0,
    canGoForward: currentIndex < navigationStack.length - 1,
    navigationDepth: currentIndex,
    navigate: navigateWithTracking,
    navigateToRoot,
    goBack,
    goForward,
    currentPath: navigationStack[currentIndex]?.path || getFullPath(),
    history: navigationStack,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
