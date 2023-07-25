import { Signature, typedData } from "starknet";
import qs from "query-string";

import { Keychain, Modal } from "./types";
import { AsyncMethodReturns } from "@cartridge/penpal";

export class Signer {
  private keychain: AsyncMethodReturns<Keychain>;
  modal: Modal;
  constructor(keychain: AsyncMethodReturns<Keychain>, modal: Modal) {
    this.keychain = keychain;
    this.modal = modal;
  }

  /**
   * Method to get the public key of the signer
   *
   * @returns public key of signer as hex string with 0x prefix
   */
  public getPubKey(): Promise<string> {
    return Promise.resolve("");
  }

  /**
   * Sign an JSON object for off-chain usage with the starknet private key and return the signature
   * This adds a message prefix so it cant be interchanged with transactions
   *
   * @param typedData - JSON object to be signed
   * @param accountAddress - account
   * @returns the signature of the JSON object
   * @throws {Error} if the JSON object is not a valid JSON
   */
  public async signMessage(
    typedData: typedData.TypedData,
    account: string
  ): Promise<Signature> {
    this.modal.open();
    const res = await this.keychain.signMessage(typedData, account);
    this.modal.close();
    return res as Signature;
  }
}
