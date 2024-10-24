import {
  Abi,
  BigNumberish,
  Call,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Signature,
  SignerInterface,
  TypedData,
} from "starknet";

import { Keychain, Modal } from "./types";
import { AsyncMethodReturns } from "@cartridge/penpal";
import { CartridgeSessionAccount } from "@cartridge/account-wasm/session";
import { normalizeCalls } from "./utils";

export class Signer implements SignerInterface {
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
    typedData: TypedData,
    account: string,
  ): Promise<Signature> {
    this.modal.open();
    const res = await this.keychain.signMessage(typedData, account);
    this.modal.close();
    return res as Signature;
  }

  public async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): Promise<Signature> {
    this.modal.open();
    const res = await this.keychain.signTransaction(
      transactions,
      transactionsDetail,
      abis,
    );
    this.modal.close();
    return res;
  }

  public async signDeployAccountTransaction(
    transaction: DeployAccountSignerDetails,
  ): Promise<Signature> {
    this.modal.open();
    const res = await this.keychain.signDeployAccountTransaction(transaction);
    this.modal.close();
    return res;
  }

  public async signDeclareTransaction(
    transaction: DeclareSignerDetails,
  ): Promise<Signature> {
    this.modal.open();
    const res = await this.keychain.signDeclareTransaction(transaction);
    this.modal.close();
    return res;
  }
}

export class SessionSigner implements SignerInterface {
  controller: CartridgeSessionAccount;

  constructor(controller: CartridgeSessionAccount) {
    this.controller = controller;
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
    _typedData: TypedData,
    _account: string,
  ): Promise<Signature> {
    throw new Error("signMessage not implemented for SessionSigner");
  }

  public async signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails & { maxFee: BigNumberish },
    _abis?: Abi[],
  ): Promise<Signature> {
    return this.controller.sign_transaction(
      normalizeCalls(transactions),
      transactionsDetail.maxFee,
    );
  }

  public async signDeployAccountTransaction(
    _transaction: DeployAccountSignerDetails,
  ): Promise<Signature> {
    throw new Error(
      "signDeployAccountTransaction not implemented for SessionSigner",
    );
  }

  public async signDeclareTransaction(
    _transaction: DeclareSignerDetails,
  ): Promise<Signature> {
    throw new Error("signDeclareTransaction not implemented for SessionSigner");
  }
}
