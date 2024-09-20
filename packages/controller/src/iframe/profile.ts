import { PROFILE_URL } from "../constants";
import { Profile, ProfileOptions } from "../types";
import { IFrame, IFrameOptions } from "./base";

export type ProfileIFrameOptions = IFrameOptions<Profile> &
  ProfileOptions & {
    address: string;
    indexerUrl: string;
  };

export class ProfileIFrame extends IFrame<Profile> {
  constructor({
    profileUrl,
    address,
    indexerUrl,
    ...iframeOptions
  }: ProfileIFrameOptions) {
    const _url = new URL(profileUrl ?? PROFILE_URL);
    _url.searchParams.set(
      "address",
      encodeURIComponent(JSON.stringify(address)),
    );
    _url.searchParams.set(
      "indexerUrl",
      encodeURIComponent(JSON.stringify(indexerUrl)),
    );

    super({
      ...iframeOptions,
      id: "controller-profile",
      url: _url,
    });
  }
}
