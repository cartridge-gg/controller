import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@/components/layout";
import { useAccount } from "@/hooks/account";
import { useToken } from "@/hooks/token";
import { ArrowIcon, Button, CopyAddress } from "@cartridge/ui-next";
import { Link, useParams } from "react-router-dom";

export function SendToken() {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { address } = useAccount();
  const t = useToken({ tokenAddress: tokenAddress! });

  if (!t) {
    return;
  }

  return (
    <LayoutContainer
      left={
        <Link to="..">
          <Button variant="icon" size="icon">
            <ArrowIcon variant="left" />
          </Button>
        </Link>
      }
    >
      <LayoutHeader
        title={`Send ${t.meta.name}`}
        description={<CopyAddress address={address} />}
        icon={
          <img
            className="w-8 h-8"
            src={t.meta.logoUrl ?? "/public/placeholder.svg"}
          />
        }
      />

      <LayoutContent className="pb-4">Send Token</LayoutContent>

      <LayoutFooter>
        <Button className="w-full">Review Send</Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
