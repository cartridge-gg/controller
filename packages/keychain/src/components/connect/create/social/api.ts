import { fetchApiCreator } from "@cartridge/ui/utils";
import { TurnkeyIframeClient } from "@turnkey/sdk-browser";

export const SOCIAL_PROVIDER_NAME = "discord";

export const fetchApi = fetchApiCreator(
  `${import.meta.env.VITE_CARTRIDGE_API_URL}/oauth2`,
  {
    credentials: "same-origin",
  },
);

export const getTurnkeySuborg = async (oidcToken: string) => {
  const getSuborgsResponse = await fetchApi<GetSuborgsResponse>("suborgs", {
    filterType: "OIDC_TOKEN",
    filterValue: oidcToken,
  });
  if (!getSuborgsResponse) {
    throw new Error("No suborgs response found");
  }

  if (getSuborgsResponse.organizationIds.length === 0) {
    throw new Error("No suborgs found");
  }

  if (getSuborgsResponse.organizationIds.length > 1) {
    throw new Error("Multiple suborgs found");
  }

  return getSuborgsResponse.organizationIds[0];
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
  if (getSuborgsResponse.organizationIds.length === 0) {
    const createSuborgResponse = await fetchApi<CreateSuborgResponse>(
      "create-suborg",
      {
        rootUserUsername: username,
        oauthProviders: [{ providerName: SOCIAL_PROVIDER_NAME, oidcToken }],
      },
    );
    targetSubOrgId = createSuborgResponse.subOrganizationId;
  } else if (getSuborgsResponse.organizationIds.length === 1) {
    targetSubOrgId = getSuborgsResponse.organizationIds[0];
  } else {
    if (import.meta.env.DEV) {
      targetSubOrgId = getSuborgsResponse.organizationIds[0];
    } else {
      // We don't want to handle multiple suborgs per user at the moment
      throw new Error("Multiple suborgs found for user");
    }
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

type GetSuborgsResponse = {
  organizationIds: string[];
};

type CreateSuborgResponse = {
  subOrganizationId: string;
};

type AuthResponse = {
  credentialBundle: string;
};
