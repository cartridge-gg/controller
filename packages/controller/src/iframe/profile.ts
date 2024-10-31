import { PROFILE_URL } from "../constants";
import { Profile, ProfileOptions } from "../types";
import { IFrame, IFrameOptions } from "./base";

export type ProfileIFrameOptions = IFrameOptions<Profile> &
  ProfileOptions & {
    rpcUrl: string;
    namespace?: string;
    username: string;
  };

export class ProfileIFrame extends IFrame<Profile> {
  constructor({
    profileUrl,
    rpcUrl,
    namespace,
    username,
    tokens,
    ...iframeOptions
  }: ProfileIFrameOptions) {
    const _profileUrl = profileUrl || PROFILE_URL;
    const _url = new URL(
      namespace
        ? `${_profileUrl}/account/${username}/slot/${namespace}`
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
