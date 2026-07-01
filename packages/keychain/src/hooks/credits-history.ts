import { useMemo } from "react";
import { CreditsHistoryQuery, useCreditsHistoryQuery } from "@/utils/api";
import { useAccount } from "@/hooks/account";

const DEFAULT_LIMIT = 100;

export type CreditsHistoryItem = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<CreditsHistoryQuery["account"]>["creditsHistory"]["edges"]
    >[number]
  >["node"]
>;

export type UseCreditsHistoryResponse = {
  items: CreditsHistoryItem[];
  status: "idle" | "loading" | "error" | "success";
  refetch: () => Promise<unknown>;
};

export function useCreditsHistory({
  first = DEFAULT_LIMIT,
}: {
  first?: number;
} = {}): UseCreditsHistoryResponse {
  const account = useAccount();
  const username = account?.username ?? "";

  const { data, status, refetch } = useCreditsHistoryQuery(
    { username, first },
    {
      enabled: !!username,
      refetchOnWindowFocus: false,
    },
  );

  const items = useMemo(
    () =>
      data?.account?.creditsHistory?.edges?.flatMap((edge) =>
        edge?.node ? [edge.node] : [],
      ) ?? [],
    [data],
  );

  return { items, status, refetch };
}
