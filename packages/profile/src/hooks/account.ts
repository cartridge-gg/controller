import { useIndexerAPI } from "@cartridge/utils";
import {
  useAccountNameQuery,
  useAddressByUsernameQuery,
} from "@cartridge/utils/api/cartridge";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export function useUsername({ address }: { address: string }) {
  const { data } = useAccountNameQuery({ address });

  return { username: data?.accounts?.edges?.[0]?.node?.username ?? "" };
}

export function useAccount() {
  const params = useParams<{
    username: string;
    project?: string;
  }>();
  const { setIndexerUrl } = useIndexerAPI();
  const username = params.username ?? "";
  const { data } = useAddressByUsernameQuery(
    { username },
    { enabled: !!username },
  );

  useEffect(() => {
    if (!params.project) {
      setIndexerUrl("");
      return;
    }

    const url = `${import.meta.env.VITE_CARTRIDGE_API_URL}/x/${
      params.project
    }/torii/graphql`;

    setIndexerUrl(url);
  }, [params.project, setIndexerUrl]);

  return {
    username,
    address: data?.account?.controllers.edges?.[0]?.node?.address ?? "",
  };
}
