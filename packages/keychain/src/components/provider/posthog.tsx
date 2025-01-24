import { PropsWithChildren, useEffect, useState } from "react";
import { PostHogContext, PostHogWrapper } from "@/context/posthog";
import { useConnectionValue } from "@/hooks/connection";

export function PostHogProvider({ children }: PropsWithChildren) {
  const { controller, origin } = useConnectionValue();

  const posthog = new PostHogWrapper(import.meta.env.VITE_POSTHOG_KEY!, {
    host: import.meta.env.VITE_POSTHOG_HOST,
    persistence: "memory",
    autocapture: false,
  });

  // Track the last identified address
  const [lastIdentifiedAddress, setLastIdentifiedAddress] = useState<string>();

  useEffect(() => {
    if (controller) {
      // Only identify if this is a new address
      if (lastIdentifiedAddress !== controller.address) {
        posthog.identify(controller.username(), {
          address: controller.address,
          class: controller.classHash(),
          chainId: controller.chainId,
        });
        setLastIdentifiedAddress(controller.address);
      }
    } else {
      posthog.reset();
      setLastIdentifiedAddress(undefined);
    }
  }, [posthog, controller, lastIdentifiedAddress]);

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
