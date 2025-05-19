import { useConnection } from "@/hooks/connection";
import { useVersion } from "@/hooks/version";
import { PostHogContext, PostHogWrapper } from "@cartridge/ui/utils";
import { PropsWithChildren, useContext, useEffect, useState } from "react";

const posthog = new PostHogWrapper(
  import.meta.env.VITE_POSTHOG_KEY ?? "api key",
  {
    host: import.meta.env.VITE_POSTHOG_HOST,
    autocapture: true,
  },
);

export function PostHogProvider({ children }: PropsWithChildren) {
  const { controller, origin } = useConnection();
  const { controllerVersion } = useVersion();

  // Track the last identified address
  const [lastIdentifiedAddress, setLastIdentifiedAddress] = useState<string>();

  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!registered && controllerVersion) {
      posthog.registerForSession({
        controllerVersion: controllerVersion.version,
      });
      setRegistered(true);
    }
  }, [registered, controllerVersion]);

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
