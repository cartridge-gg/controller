import { fetchApiCreator } from "@cartridge/utils";
import {
  Exact,
  RegisterMutation,
  Scalars,
  SignerInput,
  SignerType,
} from "@cartridge/utils/api/cartridge";
import { TurnkeyIframeClient } from "@turnkey/sdk-browser";
import { Signature } from "ethers";
import { UseMutateAsyncFunction } from "react-query";

export const SOCIAL_PROVIDER_NAME = "discord";

export const fetchApi = fetchApiCreator(
  `${import.meta.env.VITE_CARTRIDGE_API_URL}/oauth2`,
  {
    credentials: "same-origin",
  },
);

type RegisterMutateFn = UseMutateAsyncFunction<
  RegisterMutation,
  unknown,
  Exact<{
    chainId: Scalars["String"];
    owner: SignerInput;
    signature: Array<Scalars["String"]> | Scalars["String"];
    username: Scalars["String"];
  }>,
  unknown
>;

export const registerController = async (
  registerMutationFn: RegisterMutateFn,
  address: string,
  signature: Signature,
  userName: string,
) => {
  const res = await registerMutationFn({
    chainId: CHAIN_ID,
    owner: {
      credential: JSON.stringify({ eth_address: address }),
      type: SignerType.Eip191,
    },
    signature: [signature.serialized],
    username: userName,
  });
  return res;
};

export const getOrCreateTurnkeySuborg = async (
  oidcToken: string,
  username: string,
) => {
  const getSuborgsResponse = await fetchApi<GetSuborgsResponse>("suborgs", {
    filterType: "OIDC_TOKEN",
    filterValue: oidcToken,
  });
  if (!getSuborgsResponse) {
    throw new Error("No suborgs response found");
  }

  let targetSubOrgId: string;
  if (getSuborgsResponse.organizationIds.length > 1) {
    // Not supported at the moment
    throw new Error("Multiple suborgs found for user");
  } else if (getSuborgsResponse.organizationIds.length === 0) {
    const createSuborgResponse = await fetchApi<CreateSuborgResponse>(
      "create-suborg",
      {
        rootUserUsername: username,
        oauthProviders: [{ providerName: SOCIAL_PROVIDER_NAME, oidcToken }],
      },
    );
    targetSubOrgId = createSuborgResponse.subOrganizationId;
  } else {
    targetSubOrgId = getSuborgsResponse.organizationIds[0];
  }

  return targetSubOrgId;
};

export const authenticateToTurnkey = async (
  subOrgId: string,
  oidcToken: string,
  authIframeClient: TurnkeyIframeClient,
) => {
  const authResponse = await fetchApi<AuthResponse>(
    `auth`,
    {
      suborgID: subOrgId,
      targetPublicKey: authIframeClient.iframePublicKey,
      oidcToken,
      invalidateExisting: true,
    },
    {
      client_id: "turnkey",
    },
  );

  const injectResponse = await authIframeClient.injectCredentialBundle(
    authResponse.credentialBundle,
  );
  if (!injectResponse) {
    throw new Error("Failed to inject credentials into Turnkey");
  }
};

const CHAIN_ID = "SN_MAIN";

type GetSuborgsResponse = {
  organizationIds: string[];
};

type CreateSuborgResponse = {
  subOrganizationId: string;
};

type AuthResponse = {
  credentialBundle: string;
};
