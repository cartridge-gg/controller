import { KEYCHAIN_URL } from "../constants";
import { ControllerOptions, Keychain } from "../types";
import { IFrame, IFrameOptions } from "./base";

export class KeychainIFrame extends IFrame<Keychain> {
  constructor({
    url,
    paymaster,
    ...options
  }: IFrameOptions<Keychain> & Pick<ControllerOptions, "paymaster">) {
    const _url = new URL(url ?? KEYCHAIN_URL);
    if (paymaster) {
      _url.searchParams.set(
        "paymaster",
        encodeURIComponent(JSON.stringify(paymaster)),
      );
    }
    super({
      ...options,
      id: "controller-keychain",
      url: _url,
    });
  }
}
