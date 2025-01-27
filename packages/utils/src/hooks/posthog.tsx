import { useContext } from "react";
import { PostHogContext } from "../context/posthog";

export function usePostHog() {
  const context = useContext(PostHogContext);
  if (!context) {
    return undefined;
  }
  return context.posthog;
}
