import {
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
            <a
              href={externalLink}
              target="_blank"
              className="flex items-center"
            >
              <ExternalIcon size="sm" className="inline-block" />
            </a>
          )}
        </span>
      </CardDescription>
    </Card>
  );
}
