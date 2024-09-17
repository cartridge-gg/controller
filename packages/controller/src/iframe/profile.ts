import { PROFILE_URL } from "../constants";
import { Profile } from "../types";
import { IFrame, IFrameOptions } from "./base";

export class ProfileIFrame extends IFrame<Profile> {
  constructor(options: IFrameOptions<Profile>) {
    super({
      ...options,
      id: "controller-profile",
      url: new URL(options.url ?? PROFILE_URL),
    });
  }
}
