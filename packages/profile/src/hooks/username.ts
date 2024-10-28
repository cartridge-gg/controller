import { useEffect, useState } from "react";
import {
  AccountNameQuery,
  useAccountNameQuery,
} from "@cartridge/utils/api/cartridge";

export function useUsername({ address }: { address: string }) {
  const [username, setUsername] = useState<string>("");

  const { refetch: fetchName } = useAccountNameQuery(
    { address },
    {
      enabled: false,
      onSuccess: async (data: AccountNameQuery) => {
        setUsername(data.accounts?.edges?.[0]?.node?.id ?? "");
      },
    },
  );

  useEffect(() => {
    fetchName();
  }, [fetchName, address]);

  return { username };
}
