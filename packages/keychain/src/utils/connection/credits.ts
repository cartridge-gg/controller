import { ResponseCodes } from "@cartridge/controller";
import { CreditDocument, CreditQuery, CreditQueryVariables } from "@/utils/api";
import { fetchData } from "@/utils/graphql";

/**
 * Returns the Cartridge Credits balance of the currently authenticated
 * account, denominated in credits (1 credit = $0.01 USD).
 *
 * Requires an authenticated session: the handler only ever queries the
 * balance of the controller currently connected in the keychain, never an
 * arbitrary username supplied by the caller.
 */
export function creditsFactory() {
  return async (): Promise<number> => {
    if (!window.controller) {
      return Promise.reject({
        code: ResponseCodes.NOT_CONNECTED,
      });
    }

    const username = window.controller.username();
    const data = await fetchData<CreditQuery, CreditQueryVariables>(
      CreditDocument,
      { username },
    );

    const credits = data.account?.credits;
    if (!credits) {
      return 0;
    }

    return Number(credits.amount) / Math.pow(10, credits.decimals);
  };
}
