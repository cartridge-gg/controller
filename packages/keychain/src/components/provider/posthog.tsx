import { PropsWithChildren, useEffect } from "react";
import { PostHogContext, PostHogWrapper } from "@/context/posthog";
import { useConnectionValue } from "@/hooks/connection";
import { useController } from "@/hooks/controller";

export const posthog = new PostHogWrapper(import.meta.env.VITE_POSTHOG_KEY!, {
  host: import.meta.env.VITE_POSTHOG_HOST,
  persistence: "memory",
  autocapture: false,
});

export function PostHogProvider({ children }: PropsWithChildren) {
  const { origin } = useConnectionValue();
  const { controller } = useController();

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
  }, [controller]);

  useEffect(() => {
    if (origin) {
      posthog.group("company", origin);
    }
  }, [origin]);

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  );
}
