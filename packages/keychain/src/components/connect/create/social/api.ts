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
import { doApiFetch } from "./utils";

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

export const getSuborg = async (oidcToken: string, username: string) => {
  const getSuborgsResponse = await doApiFetch("suborgs", {
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
    const createSuborgResponse = await doApiFetch("create-suborg", {
      rootUserUsername: username,
      oauthProviders: [{ providerName: "Discord", oidcToken }],
    });
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
  const authResponse = await doApiFetch("auth", {
    suborgID: subOrgId,
    targetPublicKey: authIframeClient.iframePublicKey,
    oidcToken,
    invalidateExisting: true,
  });

  const injectResponse = await authIframeClient.injectCredentialBundle(
    authResponse.credentialBundle,
  );
  if (!injectResponse) {
    throw new Error("Failed to inject credentials into Turnkey");
  }
};

const CHAIN_ID = "SN_MAIN";
