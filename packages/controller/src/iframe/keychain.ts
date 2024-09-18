import { KEYCHAIN_URL } from "../constants";
import { ControllerOptions, Keychain } from "../types";
import { IFrame, IFrameOptions } from "./base";

export class KeychainIFrame extends IFrame<Keychain> {
  constructor({
    url,
    paymaster,
    policies,
    ...options
  }: IFrameOptions<Keychain> &
    Pick<ControllerOptions, "paymaster" | "policies">) {
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
      ...options,
      id: "controller-keychain",
      url: _url,
    });
  }
}
