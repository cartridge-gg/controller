export class NotReadyToConnect extends Error {
  constructor() {
    super("Not ready to connect");

    Object.setPrototypeOf(this, NotReadyToConnect.prototype);
  }
}

export class ProfileNotReady extends Error {
  constructor() {
    super("Profile is not ready");

    Object.setPrototypeOf(this, NotReadyToConnect.prototype);
  }
}
