import {
  Account as BaseAccount,
  RpcProvider,
  SignerInterface,
  Call,
  EstimateFeeDetails,
  EstimateFee,
  Signature,
  ec,
  InvokeFunctionResponse,
  TypedData,
  BigNumberish,
  InvocationsDetails,
  num,
  AllowArray,
} from "starknet";

import { selectors, VERSION } from "./selectors";
import Storage from "./storage";
import {
  CartridgeAccount,
  JsInvocationsDetails,
} from "@cartridge/account-wasm";
import { normalizeCalls } from "./connection/execute";
import { PaymasterOptions } from "@cartridge/controller";

class Account extends BaseAccount {
  rpc: RpcProvider;
  private selector: string;
  chainId: string;
  username: string;
  cartridge: CartridgeAccount;

  constructor(
    appId: string,
    chainId: string,
    nodeUrl: string,
    address: string,
    username: string,
    signer: SignerInterface,
    webauthn: {
      rpId: string;
      credentialId: string;
      publicKey: string;
    },
  ) {
    super({ nodeUrl }, address, signer);

    this.rpc = new RpcProvider({ nodeUrl });
    this.selector = selectors[VERSION].deployment(address, chainId);
    this.chainId = chainId;
    this.username = username;
    this.cartridge = CartridgeAccount.new(
      appId,
      nodeUrl,
      chainId,
      address,
      webauthn.rpId,
      username,
      webauthn.credentialId,
      webauthn.publicKey,
    );
  }

  async executeFromOutside(
    calls: AllowArray<Call>,
    paymaster: PaymasterOptions,
  ): Promise<string> {
    return await this.cartridge.executeFromOutside(
      normalizeCalls(calls),
      paymaster.caller,
    );
  }

  // @ts-expect-error TODO: fix overload type mismatch
  async execute(
    calls: AllowArray<Call>,
    details?: InvocationsDetails,
  ): Promise<InvokeFunctionResponse> {
    details.nonce = details.nonce ?? (await super.getNonce("pending"));

    const res = await this.cartridge.execute(
      normalizeCalls(calls),
      details as JsInvocationsDetails,
    );

    Storage.update(this.selector, {
      nonce: num.toHex(BigInt(details.nonce) + 1n),
    });

    this.rpc
      .waitForTransaction(res.transaction_hash, {
        retryInterval: 1000,
      })
      .catch(() => this.resetNonce());

    return res;
  }

  hasSession(calls: AllowArray<Call>): boolean {
    return this.cartridge.hasSession(normalizeCalls(calls));
  }

  sessionJson(): string {
    return this.cartridge.sessionJson();
  }

  async estimateInvokeFee(
    calls: AllowArray<Call>,
    _: EstimateFeeDetails = {},
  ): Promise<EstimateFee> {
    return await this.cartridge.estimateInvokeFee(normalizeCalls(calls), 1.5);
  }

  async verifyMessageHash(
    hash: BigNumberish,
    signature: Signature,
  ): Promise<boolean> {
    if (BigInt(signature[0]) === 0n) {
      return ec.starkCurve.verify(
        // @ts-expect-error TODO: fix overload type mismatch
        signature,
        BigInt(hash).toString(),
        signature[0],
      );
    }

    return super.verifyMessageHash(hash, signature);
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    return this.cartridge.signMessage(JSON.stringify(typedData));
  }

  async getNonce(blockIdentifier?: any): Promise<string> {
    const chainNonce = await super.getNonce(blockIdentifier);

    if (blockIdentifier !== "pending") {
      return chainNonce;
    }

    const state = Storage.get(this.selector);
    if (!state || !state.nonce || BigInt(chainNonce) > BigInt(state.nonce)) {
      return chainNonce;
    }

    return state.nonce;
  }

  resetNonce() {
    Storage.update(this.selector, {
      nonce: undefined,
    });
  }

  async delegateAccount(): Promise<string> {
    return this.cartridge.delegateAccount();
  }
}

export default Account;
