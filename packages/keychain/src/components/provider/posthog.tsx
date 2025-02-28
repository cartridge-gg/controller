import { PropsWithChildren, useEffect, useState, useContext } from "react";
import { PostHogContext, PostHogWrapper } from "@cartridge/utils";
import { useConnection } from "@/hooks/connection";

const posthog = new PostHogWrapper(
  import.meta.env.VITE_POSTHOG_KEY ?? "api key",
  {
    host: import.meta.env.VITE_POSTHOG_HOST,
    autocapture: true,
  },
);

export function PostHogProvider({ children }: PropsWithChildren) {
  const { controller, origin } = useConnection();

  // Track the last identified address
  const [lastIdentifiedAddress, setLastIdentifiedAddress] = useState<string>();

  useEffect(() => {
    if (controller) {
      // Only identify if this is a new address
      if (lastIdentifiedAddress !== controller.address()) {
        posthog.identify(controller.username(), {
          address: controller.address(),
          class: controller.classHash(),
          chainId: controller.chainId,
        });
        setLastIdentifiedAddress(controller.address());
      }
    } else {
      posthog.reset();
      setLastIdentifiedAddress(undefined);
    }
  }, [controller, lastIdentifiedAddress]);

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

export const usePostHog = () => {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error("usePostHog must be used within a PostHogProvider");
  }
  return context.posthog;
};
