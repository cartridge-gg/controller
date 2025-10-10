import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Thumbnail,
} from "@cartridge/ui";

interface TokenContractCardProps {
  icon: React.ReactNode;
  title: string;
  amount: string;
  className?: string;
}

export function TokenContractCard({
  icon,
  title,
  amount,
  className,
}: TokenContractCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between h-10">
        <CardTitle className="normal-case font-semibold text-xs">
          Spending Limit
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-row gap-3 p-3 w-full">
        <Thumbnail icon={icon} size="md" variant="lighter" rounded />
        <div className="flex flex-col w-full">
          <div className="w-full flex flex-row items-center justify-between text-sm font-medium text-foreground-100">
            <p>{title}</p>
            <p>{Number(amount)}</p>
          </div>
          <p className="text-foreground-400 text-xs font-medium">
            {Number(amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
