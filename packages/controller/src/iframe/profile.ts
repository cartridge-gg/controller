import { PROFILE_URL } from "../constants";
import { Profile, ProfileOptions } from "../types";
import { IFrame, IFrameOptions } from "./base";

export type ProfileIFrameOptions = IFrameOptions<Profile> &
  ProfileOptions & {
    rpcUrl: string;
    version?: string;
    username: string;
    slot?: string;
    namespace?: string;
  };

export class ProfileIFrame extends IFrame<Profile> {
  constructor({
    profileUrl,
    rpcUrl,
    version,
    username,
    slot,
    namespace,
    tokens,
    policies,
    ...iframeOptions
  }: ProfileIFrameOptions) {
    const _profileUrl = (profileUrl || PROFILE_URL).replace(/\/$/, "");
    let _url = new URL(
      slot
        ? `${_profileUrl}/account/${username}/slot/${slot}`
        : `${_profileUrl}/account/${username}`,
    );

    if (slot) {
      _url.searchParams.set("ps", encodeURIComponent(slot));
    }

    if (namespace) {
      _url.searchParams.set("ns", encodeURIComponent(namespace));
    }

    if (version) {
      _url.searchParams.set("v", encodeURIComponent(version));
    }

    _url.searchParams.set("rpcUrl", encodeURIComponent(rpcUrl));

    if (tokens?.erc20) {
      _url.searchParams.set(
        "erc20",
        encodeURIComponent(tokens.erc20.toString()),
      );
    }

    if (policies?.contracts) {
      const methods = Object.values(policies.contracts).flatMap(
        (contract) => contract.methods,
      );
      _url.searchParams.set(
        "methods",
        encodeURIComponent(JSON.stringify(methods)),
      );
    }

    super({
      ...iframeOptions,
      id: "controller-profile",
      url: _url,
    });
  }
}
