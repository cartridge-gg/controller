import { createContext, useContext, PropsWithChildren, useEffect } from "react";
import PostHog from "posthog-js-lite";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Properties = Record<string, any>;

class PostHogWrapper extends PostHog {
  captureException(error: Error, additionalProperties?: Properties): void {
    const properties: Properties = {
      $exception_level: "error",
      $exception_list: [
        {
          type: error.name,
          value: error.message,
          mechanism: {
            handled: true,
            synthetic: false,
          },
        },
      ],
      ...additionalProperties,
    };

    this.capture("$exception", properties);
  }
}

interface PostHogContextType {
  posthog: PostHogWrapper;
}

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

export function PostHogProvider({ children }: PropsWithChildren) {
  const posthog = new PostHogWrapper(import.meta.env.VITE_POSTHOG_KEY!, {
    host: import.meta.env.VITE_POSTHOG_HOST,
    persistence: "memory",
    autocapture: false,
  });

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost")
    ) {
      if (import.meta.env.DEV) {
        posthog.debug();
      }
    }
  }, []);

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error("usePostHog must be used within a PostHogProvider");
  }
  return context.posthog;
}
