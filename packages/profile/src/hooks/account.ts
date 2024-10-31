import {
  useAccountNameQuery,
  useAddressByUsernameQuery,
} from "@cartridge/utils/api/cartridge";
import { useParams } from "react-router-dom";

export function useUsername({ address }: { address: string }) {
  const { data } = useAccountNameQuery(
    { address },
    {
      enabled: false,
    },
  );

  return { username: data?.accounts?.edges?.[0]?.node?.id ?? "" };
}

export function useAccount() {
  const params = useParams<{ username: string; namespace?: string }>();
  const username = params.username ?? "";
  const { data } = useAddressByUsernameQuery(
    { username: username },
    { enabled: !!username },
  );

  return {
    username,
    address: data?.account?.controllers.edges?.[0]?.node?.address ?? "",
    namespace: params.namespace,
  };
}
