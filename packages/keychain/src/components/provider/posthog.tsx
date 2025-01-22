import { PropsWithChildren } from "react";
import { PostHogContext, PostHogWrapper } from "@/context/posthog";

export function PostHogProvider({ children }: PropsWithChildren) {
  const posthog = new PostHogWrapper(import.meta.env.VITE_POSTHOG_KEY!, {
    host: import.meta.env.VITE_POSTHOG_HOST,
    persistence: "memory",
    autocapture: false,
  });

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  );
}
