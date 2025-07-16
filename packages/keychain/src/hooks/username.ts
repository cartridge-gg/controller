import { useAccountNameQuery } from "@cartridge/ui/utils/api/cartridge";

export function useUsername({ address }: { address: string }) {
  const { data } = useAccountNameQuery({ address }, { enabled: !!address });
  return { username: data?.accounts?.edges?.[0]?.node?.username ?? "" };
}
