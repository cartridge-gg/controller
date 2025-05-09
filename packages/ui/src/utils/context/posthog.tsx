import { createContext } from "react";
import PostHog from "posthog-js-lite";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Properties = Record<string, any>;

export class PostHogWrapper extends PostHog {
  isLocal =
    false &&
    typeof window !== "undefined" &&
    window.location.hostname.includes("localhost");

  override capture(eventName: string, properties?: Properties): void {
    if (this.isLocal) {
      console.log("[PostHog Event]", {
        event: eventName,
        properties,
      });
      return;
    }
    super.capture(eventName, properties);
  }

  override identify(distinctId: string, properties?: Properties): void {
    if (this.isLocal) {
      console.log("[PostHog Identify]", {
        distinctId,
        properties,
      });
      return;
    }
    super.identify(distinctId, properties);
  }

  override group(
    groupType: string,
    groupKey: string,
    properties?: Properties,
  ): void {
    if (this.isLocal) {
      console.log("[PostHog Group]", {
        groupType,
        groupKey,
        properties,
      });
      return;
    }
    super.group(groupType, groupKey, properties);
  }

  override reset(): void {
    if (this.isLocal) {
      console.log("[PostHog Reset]");
      return;
    }
    super.reset();
  }

  override debug(): void {
    if (this.isLocal) {
      console.log("[PostHog Debug Mode Enabled]");
      return;
    }
    super.debug();
  }

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

export const PostHogContext = createContext<PostHogContextType | undefined>(
  undefined,
);
