import { client, ENDPOINT } from "@/utils/graphql";
import {
  BeginLoginDocument,
  BeginRegistrationDocument,
  FinalizeLoginDocument,
  FinalizeLoginMutation,
  FinalizeRegistrationDocument,
  FinalizeRegistrationMutation,
  useAccountNameQuery,
  useAccountNamesQuery,
  useAddressByUsernameQuery,
} from "@cartridge/ui/utils/api/cartridge";
import base64url from "base64url";
import { useEffect, useMemo, useState } from "react";
import { useMatch, useSearchParams } from "react-router-dom";
import { constants, getChecksumAddress } from "starknet";
import { useConnection } from "./connection";
import { useStarkAddress } from "./starknetid";
import { useWallet } from "./wallet";
import { useAccountSearchQuery } from "@/utils/api";

type RawAssertion = PublicKeyCredential & {
  response: AuthenticatorAssertionResponse;
};

type RawAttestation = PublicKeyCredential & {
  response: AuthenticatorAttestationResponse;
};

type Credentials = RawAttestation & {
  getPublicKey(): ArrayBuffer | null;
};

const createCredentials = async (
  name: string,
  beginRegistration: CredentialCreationOptions,
  hasPlatformAuthenticator: boolean,
) => {
  if (!beginRegistration.publicKey) return;
  if (beginRegistration.publicKey?.authenticatorSelection) {
    if (!hasPlatformAuthenticator || navigator.userAgent.indexOf("Win") != -1)
      beginRegistration.publicKey.authenticatorSelection.authenticatorAttachment =
        "cross-platform";
    else
      beginRegistration.publicKey.authenticatorSelection.authenticatorAttachment =
        undefined;
  }

  beginRegistration.publicKey.user.id = Buffer.from(name);
  beginRegistration.publicKey.challenge = base64url.toBuffer(
    beginRegistration.publicKey.challenge as unknown as string,
  ) as unknown as ArrayBuffer;

  // https://chromium.googlesource.com/chromium/src/+/main/content/browser/webauth/pub_key_cred_params.md
  beginRegistration.publicKey.pubKeyCredParams = [
    { alg: -257, type: "public-key" },
    { alg: -7, type: "public-key" },
  ];
  beginRegistration.publicKey.rp.id = import.meta.env.VITE_RP_ID;
  const credentials = (await navigator.credentials.create(
    beginRegistration,
  )) as RawAttestation & {
    getPublicKey(): ArrayBuffer | null;
  };

  return credentials;
};

export const onCreateBegin = async (
  name: string,
): Promise<Credentials | undefined> => {
  const hasPlatformAuthenticator =
    await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  const { data } = await beginRegistration(name);
  const credentials = await createCredentials(
    name,
    data.beginRegistration,
    hasPlatformAuthenticator,
  );

  return credentials;
};

const onCreateFinalize = (
  credentials: Credentials,
  network: string,
): Promise<FinalizeRegistrationMutation> => {
  return client.request(FinalizeRegistrationDocument, {
    network,
    credentials: JSON.stringify({
      id: credentials.id,
      rawId: base64url(Buffer.from(credentials.rawId)),
      type: credentials.type,
      response: {
        attestationObject: base64url(
          Buffer.from(credentials.response.attestationObject),
        ),
        clientDataJSON: base64url(
          Buffer.from(credentials.response.clientDataJSON),
        ),
      },
    }),
  });
};

const onLoginFinalize = (
  assertion: RawAssertion,
): Promise<FinalizeLoginMutation> => {
  return client.request(FinalizeLoginDocument, {
    credentials: JSON.stringify({
      id: assertion.id,
      type: assertion.type,
      rawId: base64url(Buffer.from(assertion.rawId)),
      clientExtensionResults: assertion.getClientExtensionResults(),
      response: {
        authenticatorData: base64url(
          Buffer.from(assertion.response.authenticatorData),
        ),
        clientDataJSON: base64url(
          Buffer.from(assertion.response.clientDataJSON),
        ),
        signature: base64url(Buffer.from(assertion.response.signature)),
      },
    }),
  });
};

type BeginREgistrationTypedJson = {
  data: {
    beginRegistration: CredentialCreationOptions;
  };
};

const beginRegistration = async (
  username: string,
): Promise<BeginREgistrationTypedJson> => {
  return doXHR(
    JSON.stringify({
      operationName: "BeginRegistration",
      query: BeginRegistrationDocument,
      variables: {
        username,
      },
    }),
  );
};

type BeginLoginReturn = {
  data: {
    beginLogin: {
      publicKey: {
        challenge: string;
      };
    };
  };
};

const beginLogin = async (username: string): Promise<BeginLoginReturn> => {
  return doXHR(
    JSON.stringify({
      operationName: "BeginLogin",
      query: BeginLoginDocument,
      variables: {
        username,
      },
    }),
  );
};

// We use XHR since fetch + webauthn causes issues with safari
const doXHR = async <T>(json: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", ENDPOINT);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject();
      }
    };
    xhr.onerror = () => {
      reject();
    };
    xhr.send(json);
  });
};

export async function doSignup(
  name: string,
  network: string,
): Promise<FinalizeRegistrationMutation | undefined> {
  const credentials = await onCreateBegin(name);
  if (!credentials) return;
  return onCreateFinalize(credentials, network);
}

export async function doLogin({
  name,
  credentialId,
  finalize,
}: {
  name: string;
  credentialId: string;
  finalize: boolean;
}) {
  const { data: beginLoginData } = await beginLogin(name);

  // TODO: replace with account_sdk device signer
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: base64url.toBuffer(
        beginLoginData.beginLogin.publicKey.challenge,
      ) as unknown as ArrayBuffer,
      timeout: 60000,
      rpId: import.meta.env.VITE_RP_ID,
      allowCredentials: [
        {
          type: "public-key",
          id: base64url.toBuffer(credentialId) as unknown as ArrayBuffer,
        },
      ],
      userVerification: "required",
    },
  })) as RawAssertion;

  if (finalize) {
    const res = await onLoginFinalize(assertion);
    if (!res.finalizeLogin) {
      throw Error("login failed");
    }
  }
}

export function useAccount() {
  const { controller } = useConnection();
  return useMemo(() => {
    if (!controller) return;
    return {
      address: controller.address(),
      username: controller.username(),
    };
  }, [controller]);
}

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

export function useAccountProfile({
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

export interface AccountSearchResult {
  id: string;
  type: "existing" | "create-new";
  username: string;
  points?: number;
  lastOnline?: Date;
}

export interface UseAccountSearchOptions {
  minLength?: number;
  debounceMs?: number;
  maxResults?: number;
  enabled?: boolean;
  validationState?: {
    status: "idle" | "validating" | "valid" | "invalid";
    exists?: boolean;
  };
}

export interface UseAccountSearchResult {
  results: AccountSearchResult[];
  isLoading: boolean;
  error?: Error;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useAccountSearch(
  query: string,
  options: UseAccountSearchOptions = {},
): UseAccountSearchResult {
  const {
    minLength = 1,
    debounceMs = 300,
    maxResults = 5,
    validationState,
    enabled = true,
  } = options;

  const trimmedQuery = query.trim().toLowerCase();
  const debouncedQuery = useDebounce(trimmedQuery, debounceMs);
  const isQueryChanging = trimmedQuery !== debouncedQuery;
  const shouldSearch = enabled && debouncedQuery.length >= minLength;

  const { data, isLoading, error } = useAccountSearchQuery(
    {
      query: debouncedQuery,
      limit: maxResults,
    },
    {
      enabled: shouldSearch,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const results = useMemo(() => {
    if (!shouldSearch) return [];

    // If query is changing, don't show stale results
    if (isQueryChanging) return [];

    const accountResults: AccountSearchResult[] = [];

    // Add existing accounts from search results
    if (data?.searchAccounts) {
      accountResults.push(
        ...data.searchAccounts.map((user) => {
          const points = user.credits
            ? Math.floor(
                Number(user.credits.amount) /
                  Math.pow(10, user.credits.decimals),
              )
            : undefined;

          return {
            id: `existing-${user.username}`,
            type: "existing" as const,
            username: user.username,
            points: points,
            lastOnline: user.updatedAt ? new Date(user.updatedAt) : undefined,
          };
        }),
      );
    }

    // Check if exact match exists
    const exactMatch = accountResults?.find(
      (result) =>
        result.username.toLowerCase() === debouncedQuery.toLowerCase(),
    );

    // If no exact match, add "Create New" option
    // But only if validation is not in progress and the username doesn't exist
    if (!exactMatch && debouncedQuery.length >= 3) {
      const shouldShowCreateNew =
        !validationState ||
        (validationState.status !== "validating" &&
          validationState.status !== "idle" &&
          !validationState.exists);

      if (shouldShowCreateNew) {
        accountResults.unshift({
          id: `create-new-${debouncedQuery}`,
          type: "create-new",
          username: debouncedQuery,
        });
      }
    }

    // Trim results based on maxResults and presence of create-new card
    const hasCreateNewCard = accountResults.some(
      (result) => result.type === "create-new",
    );

    if (hasCreateNewCard) {
      // If there's a create-new card, limit to maxResults - 1 to keep consistent total
      const otherResults = accountResults.filter(
        (result) => result.type !== "create-new",
      );
      const trimmedOtherResults = otherResults.slice(0, maxResults - 1);
      const createNewResult = accountResults.find(
        (result) => result.type === "create-new",
      );
      return createNewResult
        ? [createNewResult, ...trimmedOtherResults]
        : trimmedOtherResults;
    } else {
      // No create-new card, keep all results up to maxResults
      return accountResults.slice(0, maxResults);
    }
  }, [
    data,
    debouncedQuery,
    shouldSearch,
    validationState,
    isQueryChanging,
    maxResults,
  ]);

  return {
    results,
    isLoading: (shouldSearch && isLoading) || isQueryChanging,
    error: error as Error | undefined,
  };
}
