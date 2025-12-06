import { ErrorAlertIcon, Card, CardContent } from "@cartridge/ui";

interface ErrorCardProps {
  variant: "error" | "warning";
  title: string;
  message: string;
}

export function ErrorCard({ variant, title, message }: ErrorCardProps) {
  return (
    <Card className={`border-${variant}`}>
      <CardContent
        className={`flex flex-row items-center gap-3 p-3 text-${variant}`}
      >
        <ErrorAlertIcon variant={variant} size="sm" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-foreground-300">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
