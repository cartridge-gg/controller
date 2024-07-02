export class TransferAmountExceedsBalance extends Error {
  constructor() {
    super("Transfer amount exceeds balance");

    this.name = "TransferAmountExceedsBalance";

    Object.setPrototypeOf(this, TransferAmountExceedsBalance.prototype);
  }
}
