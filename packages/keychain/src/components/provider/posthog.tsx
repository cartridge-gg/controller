import { useConnection } from "@/hooks/connection";
import { useDevice } from "@/hooks/device";
import { useVersion } from "@/hooks/version";
import { isSafari } from "@/hooks/viewport";
import { PostHogContext, PostHogWrapper } from "@cartridge/controller-ui/utils";
import InAppSpy from "inapp-spy";
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

export const posthog = new PostHogWrapper(
  import.meta.env.VITE_POSTHOG_KEY ?? "api key",
  {
    host: import.meta.env.VITE_POSTHOG_HOST,
    autocapture: false,
  },
);

export function PostHogProvider({ children }: PropsWithChildren) {
  const { controller, origin, preset } = useConnection();
  const { controllerVersion } = useVersion();
  const { pathname } = useLocation();

  // Track the last identified address
  const [lastIdentifiedAddress, setLastIdentifiedAddress] = useState<string>();

  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!registered && controllerVersion) {
      posthog.registerForSession({
        controller_version: controllerVersion.version,
      });
      setRegistered(true);
    }
  }, [registered, controllerVersion]);

  const [{ isInApp, appKey, appName }] = useState(() => InAppSpy());
  const { isMobile } = useDevice();
  const envRegisteredRef = useRef(false);
  useEffect(() => {
    if (envRegisteredRef.current) return;
    envRegisteredRef.current = true;
    posthog.register({
      is_in_app_browser: isInApp && !!appKey,
      in_app_browser_name: appName ?? undefined,
      is_mobile: isMobile,
      is_safari: isSafari(navigator.userAgent),
    });
  }, [isInApp, appKey, appName, isMobile]);

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
      posthog.register({ origin });
    }
  }, [origin]);

  useEffect(() => {
    if (controller) {
      posthog.register({ chain_id: controller.chainId });
    }
  }, [controller]);

  useEffect(() => {
    if (preset) {
      posthog.register({ preset });
    }
  }, [preset]);

  // posthog-js-lite has no auto-pageview; fire explicitly on route change
  // so DAU/weekly-active reflect real usage.
  useEffect(() => {
    posthog.capture("$pageview", { pathname });
  }, [pathname]);

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
