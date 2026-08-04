import {
  AdvancedDetails,
  AdvancedLink,
  Card,
  CardDescription,
  ExternalIcon,
  Spinner,
  CheckIcon,
  TimesIcon,
} from "@cartridge/controller-ui";

export type ConfirmingTransactionStatus = "loading" | "success" | "error";

export function ConfirmingTransaction({
  title,
  externalLink,
  isLoading,
  status,
}: {
  title: string;
  externalLink?: string;
  isLoading?: boolean;
  status?: ConfirmingTransactionStatus;
}) {
  const resolvedStatus = status ?? (isLoading ? "loading" : "success");

  return (
    <Card className="bg-background-100 border border-background-200 p-2 transition-all duration-300">
      <CardDescription className="flex flex-row items-start gap-3 items-center">
        <span className="flex justify-between w-full">
          <span className="text-foreground-200 font-normal text-xs flex items-center gap-1">
            {resolvedStatus === "loading" ? (
              <Spinner size="sm" />
            ) : resolvedStatus === "error" ? (
              <TimesIcon size="xs" className="text-destructive" />
            ) : (
              <CheckIcon size="xs" className="text-success" />
            )}
            {title}
          </span>
          {externalLink && (
            <AdvancedDetails>
              <AdvancedLink
                href={externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
                fallback={null}
              >
                <ExternalIcon size="sm" className="inline-block" />
              </AdvancedLink>
            </AdvancedDetails>
          )}
        </span>
      </CardDescription>
    </Card>
  );
}
