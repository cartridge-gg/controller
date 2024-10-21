import { Link, useParams } from "react-router-dom";
import { LayoutContainer, LayoutContent, LayoutHeader } from "../layout";
import { ArrowIcon, Button, CopyAddress, Skeleton } from "@cartridge/ui-next";
import { useToken } from "@/hooks/context";

export function Token() {
  const { address } = useParams<{ address: string }>();
  const t = useToken(address!);

  if (!t) {
    return;
  }

  return (
    <LayoutContainer
      left={
        <Link to="/inventory">
          <Button variant="icon" size="icon">
            <ArrowIcon variant="left" />
          </Button>
        </Link>
      }
    >
      <LayoutHeader
        title={`${
          t.balance === undefined ? (
            <Skeleton className="h-[20px] w-[120px] rounded" />
          ) : (
            t.balance.toString()
          )
        } ${t.symbol}`}
        description={<CopyAddress address={t.address} size="sm" />}
        icon={
          <img
            className="w-8 h-8"
            src={t.logoUrl ?? "/public/placeholder.svg"}
          />
        }
      />

      <LayoutContent className="pb-4"></LayoutContent>
    </LayoutContainer>
  );
}
