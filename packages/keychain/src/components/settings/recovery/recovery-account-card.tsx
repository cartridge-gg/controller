import { Card } from "@cartridge/controller-ui";
import { formatAddress } from "@cartridge/controller-ui/utils";
import { useStarkName } from "@/hooks/starknetid";

interface RecoveryAccountCardProps {
  address: string;
}

export const RecoveryAccountCard = ({ address }: RecoveryAccountCardProps) => {
  const { name } = useStarkName({ address });

  return (
    <Card className="py-2.5 px-3 flex flex-row justify-between items-center bg-background-200">
      <p className="text-sm text-foreground-100">
        {name ?? formatAddress(address, { first: 6, last: 4 })}
      </p>
      {name && (
        <p className="text-xs text-foreground-300">
          {formatAddress(address, { first: 6, last: 4 })}
        </p>
      )}
    </Card>
  );
};
