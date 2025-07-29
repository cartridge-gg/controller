import { fetchApi } from "@/wallets/social/turnkey_utils";

export const getDiscordUsername = async (
  controllerUsername: string | undefined,
) => {
  try {
    const getOauthProvidersResponse = await fetchApi<GetOauthProvidersResponse>(
      "get-oauth-providers",
      {
        controllerUsername: controllerUsername,
      },
    );
    return getOauthProvidersResponse.find(
      (provider: GetOauthProvidersResponse[0]) =>
        provider.providerName === "discord",
    )?.subject;
  } catch (error) {
    if (error instanceof Error && error.message.includes("status: 500")) {
      return undefined;
    }
    console.error(error);
    return undefined;
  }
};

type GetOauthProvidersResponse = {
  audience: string;
  createdAt: { nanos: string; seconds: string };
  issuer: string;
  providerId: string;
  providerName: string;
  subject: string;
  updatedAt: { nanos: string; seconds: string };
}[];
