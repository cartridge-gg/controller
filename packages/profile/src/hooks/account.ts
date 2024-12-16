import { useIndexerAPI } from "@cartridge/utils";
import {
  useAccountNameQuery,
  useAddressByUsernameQuery,
} from "@cartridge/utils/api/cartridge";
import { usePostHog } from "posthog-js/react";
import { useEffect, useMemo, useRef } from "react";
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
  const { setIndexerUrl, isReady } = useIndexerAPI();
  const username = params.username ?? "";
  const { data } = useAddressByUsernameQuery(
    { username },
    { enabled: isReady && !!username },
  );

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!params.project || !isFirstRender.current) {
      return;
    }

    const url = `${import.meta.env.VITE_CARTRIDGE_API_URL}/x/${
      params.project
    }/torii/graphql`;

    setIndexerUrl(url);
    isFirstRender.current = false;
  }, [params.project, setIndexerUrl]);

  const address = useMemo(
    () =>
      import.meta.env.VITE_MOCKED_ACCOUNT_ADDRESS ??
      data?.account?.controllers.edges?.[0]?.node?.address ??
      "",
    [data],
  );

  const posthog = usePostHog();
  useEffect(() => {
    posthog.setPersonPropertiesForFlags({ address });
  }, [posthog, address]);

  return {
    username,
    address,
  };
}
