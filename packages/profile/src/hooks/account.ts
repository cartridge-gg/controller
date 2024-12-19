import { useIndexerAPI } from "@cartridge/utils";
import {
  useAccountNameQuery,
  useAddressByUsernameQuery,
} from "@cartridge/utils/api/cartridge";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useStarkAddress } from "./starknetid";
import { useWallet } from "./wallet";

export function useUsername({ address }: { address: string }) {
  const { data } = useAccountNameQuery({ address });

  return { username: data?.accounts?.edges?.[0]?.node?.username ?? "" };
}

export function useAddress({ username }: { username: string }) {
  const { isReady } = useIndexerAPI();
  const { data, isFetching } = useAddressByUsernameQuery(
    { username },
    { enabled: isReady && !!username },
  );

  return {
    address: data?.account?.controllers?.edges?.[0]?.node?.address ?? "",
    isFetching,
  };
}

export function useAccountInfo({ nameOrAddress }: { nameOrAddress: string }) {
  const [starkName, setStarkName] = useState("");
  const [controllerName, setControllerName] = useState("");

  useEffect(() => {
    // If the address ends with .stark, set the stark name
    if (nameOrAddress.endsWith(".stark")) {
      setStarkName(nameOrAddress);
      setControllerName("");
      return;
    }
    // If the address matches a controller name, set the controller name
    if (
      nameOrAddress.match(/^[a-z0-9]+$/) &&
      nameOrAddress.length >= 3 &&
      nameOrAddress.length <= 30
    ) {
      setControllerName(nameOrAddress);
      setStarkName("");
      return;
    }
    // Otherwise, clear the names
    setStarkName("");
    setControllerName("");
  }, [nameOrAddress]);

  // Fetch the stark address
  const { address: starkAddress, isFetching: isFetchingStarkAddress } =
    useStarkAddress({ name: starkName });
  // Fetch the controller address
  const {
    address: controllerAddress,
    isFetching: isFetchingControllerAddress,
  } = useAddress({ username: controllerName });

  const name = useMemo(() => {
    if (starkName) {
      return starkName;
    }
    if (controllerName) {
      return controllerName;
    }
    return "";
  }, [starkName, controllerName]);

  const address = useMemo(() => {
    if (starkAddress) {
      return starkAddress;
    }
    if (controllerAddress) {
      return controllerAddress;
    }
    if (nameOrAddress.startsWith("0x")) {
      return nameOrAddress;
    }
    return "";
  }, [starkAddress, controllerAddress, nameOrAddress]);
  
  // Fetch class hash
  const { wallet, isFetching: isFetchingClassHash } = useWallet({ address });

  return {
    name,
    address,
    wallet,
    isFetching:
      isFetchingStarkAddress ||
      isFetchingControllerAddress ||
      isFetchingClassHash,
  };
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

  return {
    username,
    address,
  };
}
