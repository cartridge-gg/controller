import { KEYCHAIN_URL } from "../constants";
import { Keychain, KeychainOptions } from "../types";
import { IFrame, IFrameOptions } from "./base";

type KeychainIframeOptions = IFrameOptions<Keychain> & KeychainOptions;

export class KeychainIFrame extends IFrame<Keychain> {
  constructor({
    url,
    paymaster,
    policies,
    ...iframeOptions
  }: KeychainIframeOptions) {
    const _url = new URL(url ?? KEYCHAIN_URL);
    if (paymaster) {
      _url.searchParams.set(
        "paymaster",
        encodeURIComponent(JSON.stringify(paymaster)),
      );
    }
    if (policies) {
      _url.searchParams.set(
        "policies",
        encodeURIComponent(JSON.stringify(policies)),
      );
    }

    super({
      ...iframeOptions,
      id: "controller-keychain",
      url: _url,
    });
  }
}
