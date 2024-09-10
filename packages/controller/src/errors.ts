export class NotReadyToConnect extends Error {
  constructor() {
    super("Not ready to connect");

    Object.setPrototypeOf(this, NotReadyToConnect.prototype);
  }
}
