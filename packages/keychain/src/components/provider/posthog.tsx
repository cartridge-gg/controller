import { PropsWithChildren, useEffect } from "react";
import { PostHogContext, PostHogWrapper } from "@/context/posthog";
import { useConnectionValue } from "@/hooks/connection";

export function PostHogProvider({ children }: PropsWithChildren) {
  const { controller, origin } = useConnectionValue();

  const posthog = new PostHogWrapper(import.meta.env.VITE_POSTHOG_KEY!, {
    host: import.meta.env.VITE_POSTHOG_HOST,
    persistence: "memory",
    autocapture: false,
  });

  useEffect(() => {
    if (controller) {
      posthog.identify(controller.username(), {
        address: controller.address,
        class: controller.classHash(),
        chainId: controller.chainId,
      });
    } else {
      posthog.reset();
    }
  }, [posthog, controller]);

  useEffect(() => {
    if (origin) {
      posthog.group("company", origin);
    }
  }, [posthog, origin]);

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  );
}
