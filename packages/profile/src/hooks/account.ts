import { useIndexerAPI } from "@cartridge/utils";
import {
  useAccountNameQuery,
  useAddressByUsernameQuery,
} from "@cartridge/utils/api/cartridge";
import { useEffect } from "react";
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
  const { setIndexerUrl } = useIndexerAPI();
  const username = params.username ?? "";
  const { data } = useAddressByUsernameQuery(
    { username },
    { enabled: !!username },
  );

  useEffect(() => {
    if (!params.namespace) {
      setIndexerUrl("");
      return;
    }

    const url = import.meta.env.PROD
      ? `${import.meta.env.VITE_CARTRIDGE_API_URL}/x/slot/${
          params.namespace
        }/graphql`
      : "http://localhost:8080";

    setIndexerUrl(url);
  }, [params.namespace, setIndexerUrl]);

  return {
    username,
    address: data?.account?.controllers.edges?.[0]?.node?.address ?? "",
    namespace: params.namespace,
  };
}
