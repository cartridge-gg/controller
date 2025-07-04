import {
  useAccountNameQuery,
  useAccountNamesQuery,
  useAddressByUsernameQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useEffect, useMemo, useState } from "react";
import { useMatch, useSearchParams } from "react-router-dom";
import { useStarkAddress } from "./starknetid";
import { useWallet } from "./wallet";
import { constants, getChecksumAddress } from "starknet";

export function useUsername({ address }: { address: string }) {
  const { data } = useAccountNameQuery({ address }, { enabled: !!address });

  return { username: data?.accounts?.edges?.[0]?.node?.username ?? "" };
}

export function useUsernames({ addresses }: { addresses: string[] }) {
  const { data } = useAccountNamesQuery(
    { addresses },
    { enabled: addresses.length > 0 },
  );

  return {
    usernames:
      data?.accounts?.edges?.map((edge) => ({
        username: edge?.node?.username,
        address: edge?.node?.controllers?.edges?.[0]?.node?.address,
      })) ?? [],
  };
}

export function useAddress({ username }: { username: string }) {
  const { data, error, isFetching } = useAddressByUsernameQuery(
    { username },
    { enabled: !!username },
  );

  return {
    address: data?.account?.controllers?.edges?.[0]?.node?.address ?? "",
    error,
    isFetching,
  };
}

export type UseAccountInfoResponse = {
  name: string;
  address: string;
  wallet: string | null;
  isFetching: boolean;
  error: string;
  warning: string;
};

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
      nameOrAddress.match(/^[a-z0-9-.]+$/) &&
      !nameOrAddress.replace("0x", "").match(/^[0-9a-fA-F]+$/) &&
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
  const {
    address: starkAddress,
    error: starkError,
    isFetching: isFetchingStarkAddress,
  } = useStarkAddress({ name: starkName });
  // Fetch the controller address
  const {
    address: controllerAddress,
    error: controllerError,
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
      return getChecksumAddress(starkAddress);
    }
    if (controllerAddress) {
      return getChecksumAddress(controllerAddress);
    }
    if (
      nameOrAddress.startsWith("0x") &&
      nameOrAddress.replace("0x", "").match(/^[0-9a-fA-F]+$/) &&
      BigInt(nameOrAddress) < constants.PRIME &&
      nameOrAddress.length >= 62
    ) {
      return getChecksumAddress(nameOrAddress);
    }
    return "";
  }, [starkAddress, controllerAddress, nameOrAddress]);

  // Fetch class hash
  const {
    wallet,
    error: walletError,
    isFetching: isFetchingClassHash,
  } = useWallet({ address });

  const error = useMemo(() => {
    if (starkName && starkError) {
      return "Could not get address from stark name";
    }
    if (controllerName && controllerError) {
      return "Could not get address from controller name";
    }
    if (address && !address.startsWith("0x")) {
      return 'Starknet address must start with "0x"';
    }
    if (
      address &&
      (BigInt(address) >= constants.PRIME || address.length < 62)
    ) {
      return "Please input a valid Starknet address";
    }
    if (!!nameOrAddress && !address) {
      return "Please input a valid Starknet address";
    }
    return "";
  }, [
    starkError,
    controllerError,
    address,
    controllerName,
    starkName,
    nameOrAddress,
  ]);

  const warning = useMemo(() => {
    return walletError;
  }, [walletError]);

  return {
    name,
    address,
    wallet,
    isFetching:
      isFetchingStarkAddress ||
      isFetchingControllerAddress ||
      isFetchingClassHash,
    error,
    warning,
  };
}

export type UseAccountResponse = {
  username: string;
  address: string;
};

export function useAccount({
  overridable,
}: {
  overridable?: boolean;
} = {}): UseAccountResponse {
  // To be used in top level provider (Above Route component)
  // Ref: https://stackoverflow.com/a/75462921
  const match = useMatch("/account/:username/*");
  const [searchParams] = useSearchParams();

  const username = match?.params.username ?? "";
  const { data: usernameData } = useAddressByUsernameQuery(
    { username },
    { enabled: !!username },
  );

  const address = useMemo(
    () =>
      (import.meta.env.VITE_MOCKED_ACCOUNT_ADDRESS as string) ??
      usernameData?.account?.controllers.edges?.[0]?.node?.address ??
      "",
    [usernameData],
  );

  const addressParam = searchParams.get("address");
  const { data: addressData } = useAccountNameQuery(
    { address: addressParam || "" },
    {
      enabled:
        !!addressParam &&
        addressParam.startsWith("0x") &&
        !!addressParam.replace("0x", "").match(/^[0-9a-fA-F]+$/) &&
        overridable,
    },
  );
  const usernameParam = useMemo(() => {
    if (
      !addressParam ||
      !addressParam.startsWith("0x") ||
      !addressParam.replace("0x", "").match(/^[0-9a-fA-F]+$/)
    )
      return;
    const username = addressData?.accounts?.edges?.[0]?.node?.username;
    if (!username) return `0x${BigInt(addressParam).toString(16)}`.slice(0, 9);
    return username;
  }, [addressParam, addressData]);

  return {
    username: overridable && usernameParam ? usernameParam : username,
    address: overridable && addressParam ? addressParam : address,
  };
}
