import { useConnection } from "@/hooks/connection";
import { requestStorageAccessFactory } from "@/utils/connection/storage-access";
import {
  Button,
  HeaderInner,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  AlertIcon,
} from "@cartridge/ui";
import { useCallback, useState } from "react";

interface StorageAccessPromptProps {
  onSuccess: () => void;
  onError?: (error: Error) => void;
}

export function StorageAccessPrompt({
  onSuccess,
  onError,
}: StorageAccessPromptProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, parent } = useConnection();

  console.log(
    "[Storage Access Flow] StorageAccessPrompt: Component rendered and waiting for user interaction",
  );
  console.log(
    "[Storage Access Flow] StorageAccessPrompt: Application name =",
    theme.name,
  );
  console.log(
    "[Storage Access Flow] StorageAccessPrompt: Parent connection available =",
    !!parent,
  );

  const handleContinue = useCallback(async () => {
    console.log(
      "[Storage Access Flow] StorageAccessPrompt: User clicked Continue button (USER GESTURE CAPTURED)",
    );
    setIsRequesting(true);
    setError(null);

    try {
      console.log(
        "[Storage Access Flow] StorageAccessPrompt: Creating requestStorageAccess function",
      );
      const requestStorageAccess = requestStorageAccessFactory();
      console.log(
        "[Storage Access Flow] StorageAccessPrompt: Calling requestStorageAccess() now...",
      );
      const granted = await requestStorageAccess();
      console.log(
        "[Storage Access Flow] StorageAccessPrompt: requestStorageAccess() returned:",
        granted,
      );

      if (granted) {
        console.log(
          "[Storage Access Flow] StorageAccessPrompt: SUCCESS - Storage access granted",
        );

        // Notify parent controller that storage access was granted
        if (
          parent &&
          "onStorageAccessGranted" in parent &&
          typeof parent.onStorageAccessGranted === "function"
        ) {
          console.log(
            "[Storage Access Flow] StorageAccessPrompt: Calling parent.onStorageAccessGranted()",
          );
          try {
            await parent.onStorageAccessGranted();
            console.log(
              "[Storage Access Flow] StorageAccessPrompt: Parent notified successfully",
            );
          } catch (err) {
            console.error(
              "[Storage Access Flow] StorageAccessPrompt: Error notifying parent:",
              err,
            );
          }
        } else {
          console.warn(
            "[Storage Access Flow] StorageAccessPrompt: Parent onStorageAccessGranted method not available",
          );
        }

        console.log(
          "[Storage Access Flow] StorageAccessPrompt: Calling onSuccess() callback",
        );
        onSuccess();
      } else {
        const errorMsg = "Storage access was not granted";
        console.error(
          "[Storage Access Flow] StorageAccessPrompt: FAILED - Storage access denied",
        );
        setError(errorMsg);
        if (onError) {
          onError(new Error(errorMsg));
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to request storage access";
      console.error(
        "[Storage Access Flow] StorageAccessPrompt: EXCEPTION caught:",
        err,
      );
      console.error(
        "[Storage Access Flow] StorageAccessPrompt: Error message:",
        errorMsg,
      );
      setError(errorMsg);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMsg));
      }
    } finally {
      console.log(
        "[Storage Access Flow] StorageAccessPrompt: Request completed, isRequesting = false",
      );
      setIsRequesting(false);
    }
  }, [onSuccess, onError, parent]);

  return (
    <LayoutContainer>
      <HeaderInner
        title={`Connect to ${theme.name || "Application"}`}
        description="Click Continue to enable secure access"
      />
      <LayoutContent className="flex flex-col gap-4">
        <div className="w-full flex flex-col items-center justify-center py-6 px-4 gap-3 rounded border border-background-200">
          <div className="text-sm text-center text-foreground-200">
            This application needs access to your Controller to continue.
          </div>
          <div className="text-xs text-center text-foreground-400">
            You'll be able to sign transactions and interact with the
            application.
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-destructive-100 p-3 bg-background-100 rounded-md border border-destructive-100">
            <AlertIcon className="flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <div>{error}</div>
              <button
                onClick={handleContinue}
                className="text-left underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </LayoutContent>
      <LayoutFooter>
        <Button
          className="w-full"
          disabled={isRequesting}
          isLoading={isRequesting}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
