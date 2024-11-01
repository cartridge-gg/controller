import { useAccountNameQuery } from "@cartridge/utils/api/cartridge";

export function useUsername({ address }: { address: string }) {
  const { data } = useAccountNameQuery({ address });

  return { username: data?.accounts?.edges?.[0]?.node?.username ?? "" };
}
