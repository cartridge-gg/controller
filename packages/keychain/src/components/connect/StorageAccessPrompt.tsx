import {
  AlertIcon,
  Button,
  HeaderInner,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";

export type StorageAccessPromptProps = {
  appName?: string;
  onContinue: () => void;
  isLoading?: boolean;
  error?: string | null;
};

export function StorageAccessPrompt({
  appName,
  onContinue,
  isLoading,
  error,
}: StorageAccessPromptProps) {
  const title = appName ? `Enable storage for ${appName}` : "Enable storage";

  return (
    <LayoutContainer>
      <HeaderInner
        className="pb-10"
        title={title}
        description="Tap continue to re-enable storage access so your Controller stays connected in embedded apps."
      />
      <LayoutContent className="pb-0 flex flex-col gap-4">
        <div className="text-xs text-muted-foreground p-3 bg-background-100 rounded-md border border-border">
          This is required by Safari and WKWebView after an app restart.
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-destructive-100 p-3 bg-background-100 rounded-md border border-destructive-100">
            <AlertIcon className="flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <div>{error}</div>
              <button
                onClick={onContinue}
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
          disabled={isLoading}
          isLoading={isLoading}
          onClick={onContinue}
        >
          Continue
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
