import { PROFILE_URL } from "../constants";
import { Profile, ProfileOptions } from "../types";
import { IFrame, IFrameOptions } from "./base";

export type ProfileIFrameOptions = IFrameOptions<Profile> &
  ProfileOptions & {
    address: string;
    username: string;
    indexerUrl: string;
    rpcUrl: string;
  };

export class ProfileIFrame extends IFrame<Profile> {
  constructor({
    profileUrl,
    address,
    username,
    indexerUrl,
    rpcUrl,
    tokens,
    ...iframeOptions
  }: ProfileIFrameOptions) {
    const _url = new URL(profileUrl ?? PROFILE_URL);
    _url.searchParams.set("address", encodeURIComponent(address));
    _url.searchParams.set("username", encodeURIComponent(username));
    _url.searchParams.set("indexerUrl", encodeURIComponent(indexerUrl));
    _url.searchParams.set("rpcUrl", encodeURIComponent(rpcUrl));

    if (tokens?.erc20) {
      _url.searchParams.set(
        "erc20",
        encodeURIComponent(JSON.stringify(tokens.erc20)),
      );
    }

    if (tokens?.erc1155) {
      _url.searchParams.set(
        "erc20",
        encodeURIComponent(JSON.stringify(tokens.erc1155)),
      );
    }

    super({
      ...iframeOptions,
      id: "controller-profile",
      url: _url,
    });
  }
}
