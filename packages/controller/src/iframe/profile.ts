import { PROFILE_URL } from "../constants";
import { Profile, ProfileOptions } from "../types";
import { IFrame, IFrameOptions } from "./base";

export type ProfileIFrameOptions = IFrameOptions<Profile> &
  ProfileOptions & {
    rpcUrl: string;
    indexerUrl?: string;
    namespace?: string;
    username: string;
  };

export class ProfileIFrame extends IFrame<Profile> {
  constructor({
    profileUrl,
    rpcUrl,
    indexerUrl,
    namespace,
    username,
    tokens,
    ...iframeOptions
  }: ProfileIFrameOptions) {
    const _url = new URL(`${profileUrl ?? PROFILE_URL}/account/${username}`);
    _url.searchParams.set("rpcUrl", encodeURIComponent(rpcUrl));

    if (indexerUrl) {
      _url.searchParams.set("indexerUrl", encodeURIComponent(indexerUrl));
    }
    if (namespace) {
      _url.searchParams.set("namespace", encodeURIComponent(namespace));
    }

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
