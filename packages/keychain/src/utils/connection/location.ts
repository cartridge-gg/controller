import {
  ConnectError,
  LocationPromptReply,
  LocationPromptOptions,
} from "@cartridge/controller";
import { generateCallbackId, getCallbacks, storeCallbacks } from "./callbacks";

export type LocationPromptParams = {
  id: string;
};

type LocationPromptCallback = {
  resolve?: (result: LocationPromptReply | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
};

function isLocationPromptResult(
  value: unknown,
): value is LocationPromptReply | ConnectError {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.code === "string" && ("message" in obj || "location" in obj);
}

export function createLocationPromptUrl(
  options: LocationPromptCallback & LocationPromptOptions = {},
): string {
  const id = generateCallbackId();

  if (options.resolve || options.reject || options.onCancel) {
    storeCallbacks(id, {
      resolve: options.resolve
        ? (result) => {
            if (!isLocationPromptResult(result)) {
              const error = new Error("Invalid location prompt result type");
              console.error(error.message, result);
              options.reject?.(error);
              return;
            }
            options.resolve?.(result);
          }
        : undefined,
      reject: options.reject,
      onCancel: options.onCancel,
    });
  }

  let url = `/location?id=${encodeURIComponent(id)}`;

  if (options.returnTo) {
    url += `&returnTo=${encodeURIComponent(options.returnTo)}`;
  }

  return url;
}

export function parseLocationPromptParams(searchParams: URLSearchParams): {
  params: LocationPromptParams;
  resolve?: (result: unknown) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
} | null {
  try {
    const id = searchParams.get("id");

    if (!id) {
      console.error("Missing required parameters");
      return null;
    }

    const callbacks = getCallbacks(id) as LocationPromptCallback | undefined;

    const reject = callbacks?.reject
      ? (reason?: unknown) => {
          callbacks.reject?.(reason);
        }
      : undefined;

    const resolve = callbacks?.resolve
      ? (value: unknown) => {
          if (!isLocationPromptResult(value)) {
            const error = new Error("Invalid location prompt result type");
            console.error(error.message, value);
            reject?.(error);
            return;
          }
          callbacks.resolve?.(value);
        }
      : undefined;

    const onCancel = callbacks?.onCancel
      ? () => {
          callbacks.onCancel?.();
        }
      : undefined;

    return {
      params: { id },
      resolve,
      reject,
      onCancel,
    };
  } catch (error) {
    console.error("Failed to parse location prompt params:", error);
    return null;
  }
}

export function locationPromptFactory({
  navigate,
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
}) {
  return (options?: LocationPromptOptions) =>
    new Promise<LocationPromptReply | ConnectError>((resolve, reject) => {
      const url = createLocationPromptUrl({
        resolve,
        reject,
        returnTo: options?.returnTo,
      });

      navigate(url, { replace: true });
    });
}
