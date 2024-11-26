import { useIndexerAPI } from "@cartridge/utils";
import { useAccountNameQuery } from "@cartridge/utils/api/cartridge";

export function useUsername({ address }: { address: string }) {
  const { isReady } = useIndexerAPI();
  const { data } = useAccountNameQuery({ address }, { enabled: isReady });

  return { username: data?.accounts?.edges?.[0]?.node?.username ?? "" };
}
