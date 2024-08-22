export class TransferAmountExceedsBalance extends Error {
  constructor() {
    super("Transfer amount exceeds balance");

    this.name = "TransferAmountExceedsBalance";

    Object.setPrototypeOf(this, TransferAmountExceedsBalance.prototype);
  }
}

export class ControllerNotReady extends Error {
  constructor() {
    super("Controller is not ready");

    this.name = "ControllerNotReady";

    Object.setPrototypeOf(this, ControllerNotReady.prototype);
  }
}
