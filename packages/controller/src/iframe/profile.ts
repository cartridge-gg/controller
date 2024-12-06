import { PROFILE_URL } from "../constants";
import { Profile, ProfileOptions } from "../types";
import { IFrame, IFrameOptions } from "./base";

export type ProfileIFrameOptions = IFrameOptions<Profile> &
  ProfileOptions & {
    rpcUrl: string;
    username: string;
    slot?: string;
    namespace?: string;
  };

export class ProfileIFrame extends IFrame<Profile> {
  constructor({
    profileUrl,
    rpcUrl,
    namespace,
    slot,
    username,
    tokens,
    ...iframeOptions
  }: ProfileIFrameOptions) {
    const _profileUrl = (profileUrl || PROFILE_URL).replace(/\/$/, "");
    const _url = new URL(
      slot
        ? namespace
          ? `${_profileUrl}/account/${username}/slot/${slot}?ps=${encodeURIComponent(
              slot,
            )}&ns=${encodeURIComponent(namespace)}`
          : `${_profileUrl}/account/${username}/slot/${slot}?ps=${encodeURIComponent(
              slot,
            )}`
        : `${_profileUrl}/account/${username}`,
    );

    _url.searchParams.set("rpcUrl", encodeURIComponent(rpcUrl));

    if (tokens?.erc20) {
      _url.searchParams.set(
        "erc20",
        encodeURIComponent(tokens.erc20.toString()),
      );
    }

    super({
      ...iframeOptions,
      id: "controller-profile",
      url: _url,
    });
  }
}
