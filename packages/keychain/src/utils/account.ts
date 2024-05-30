import {
  constants,
  Account as BaseAccount,
  RpcProvider,
  SignerInterface,
  Call,
  EstimateFeeDetails,
  EstimateFee,
  Signature,
  AllowArray,
  ec,
  InvokeFunctionResponse,
  TypedData,
  BigNumberish,
  waitForTransactionOptions,
  TransactionFinalityStatus,
  InvocationsDetails,
  num,
} from "starknet";
import {
  AccountContractDocument,
  AccountContractQuery,
} from "generated/graphql";
import { client } from "utils/graphql";

import selectors from "./selectors";
import Storage from "./storage";
import { CartridgeAccount } from "@cartridge/account-wasm";
import { Session } from "@cartridge/controller";

const EST_FEE_MULTIPLIER = 2n;

export enum Status {
  COUNTERFACTUAL = "COUNTERFACTUAL",
  DEPLOYING = "DEPLOYING",
  DEPLOYED = "DEPLOYED",
}

class Account extends BaseAccount {
  rpc: RpcProvider;
  private selector: string;
  chainId: constants.StarknetChainId;
  cartridge: CartridgeAccount;

  constructor(
    chainId: constants.StarknetChainId,
    nodeUrl: string,
    address: string,
    signer: SignerInterface,
    webauthn: {
      rpId: string;
      origin: string;
      credentialId: string;
      publicKey: string;
    },
  ) {
    super({ nodeUrl }, address, signer);

    this.rpc = new RpcProvider({ nodeUrl });
    this.selector = selectors["0.0.1"].deployment(address, chainId);
    this.chainId = chainId;
    this.cartridge = CartridgeAccount.new(
      nodeUrl,
      chainId,
      address,
      webauthn.rpId,
      webauthn.origin,
      webauthn.credentialId,
      webauthn.publicKey,
    );

    const state = Storage.get(this.selector);
    if (!state || Date.now() - state.syncing > 5000) {
      this.sync();
      return;
    }
  }

  static get waitForTransactionOptions(): waitForTransactionOptions {
    return {
      retryInterval: 1000,
      successStates: [
        TransactionFinalityStatus.ACCEPTED_ON_L1,
        TransactionFinalityStatus.ACCEPTED_ON_L2,
      ],
      errorStates: [
        TransactionFinalityStatus.ACCEPTED_ON_L1,
        TransactionFinalityStatus.ACCEPTED_ON_L2,
      ],
    };
  }

  get status() {
    const state = Storage.get(this.selector);
    if (!state || !state.status) {
      return Status.COUNTERFACTUAL;
    }

    return state.status;
  }

  set status(status: Status) {
    Storage.update(this.selector, {
      status,
    });
  }

  async getDeploymentTxn(): Promise<string | undefined> {
    let chainId = this.chainId.substring(2);
    chainId = Buffer.from(chainId, "hex").toString("ascii");

    try {
      const data: AccountContractQuery = await client.request(
        AccountContractDocument,
        {
          id: `starknet:${chainId}:${this.address}`,
        },
      );

      if (!data?.contract?.deployTransaction?.id) {
        console.error("could not find deployment txn");
        return;
      }

      return data.contract.deployTransaction.id.split("/")[1];
    } catch (e) {
      if (e.message.includes("not found")) {
        return Promise.resolve(undefined);
      }

      return Promise.reject(e);
    }
  }

  async sync() {
    Storage.update(this.selector, {
      syncing: Date.now(),
    });

    try {
      switch (this.status) {
        case Status.DEPLOYING:
        case Status.COUNTERFACTUAL: {
          const hash = await this.getDeploymentTxn();
          if (!hash) return;
          const receipt = await this.rpc.getTransactionReceipt(hash);
          if (receipt.isReverted() || receipt.isRejected()) {
            // TODO: Handle redeployment
            this.status = Status.COUNTERFACTUAL;
            return;
          }

          const classHash = await this.rpc.getClassHashAt(
            this.address,
            "pending",
          );
          Storage.update(this.selector, {
            classHash,
          });
          this.status = Status.DEPLOYED;
          return;
        }
      }
    } catch (e) {
      /* no-op */
    }
  }

  // @ts-expect-error TODO: fix overload type mismatch
  async execute(
    calls: AllowArray<Call>,
    session: Session,
    transactionsDetail?: InvocationsDetails,
  ): Promise<InvokeFunctionResponse> {
    if (this.status === Status.COUNTERFACTUAL) {
      throw new Error("Account is not deployed");
    }

    transactionsDetail.nonce =
      transactionsDetail.nonce ?? (await this.getNonce("pending"));
    transactionsDetail.maxFee = num.toHex(transactionsDetail.maxFee);

    const res = await this.cartridge
      .execute(calls as Array<Call>, transactionsDetail, session)
      .catch((e) => {
        throw new Error("Execute error: " + e.message);
      });

    Storage.update(this.selector, {
      nonce: (BigInt(transactionsDetail.nonce) + 1n).toString(),
    });

    this.rpc
      .waitForTransaction(res.transaction_hash, {
        retryInterval: 1000,
        successStates: [
          TransactionFinalityStatus.ACCEPTED_ON_L1,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      })
      .catch(() => {
        this.resetNonce();
      });

    return res;
  }

  async estimateInvokeFee(
    calls: Call[],
    details: EstimateFeeDetails = {},
  ): Promise<EstimateFee> {
    details.blockIdentifier = details.blockIdentifier ?? "pending";

    if (this.status === Status.COUNTERFACTUAL) {
      throw new Error("Account is not deployed");
    }

    details.nonce = details.nonce ?? (await super.getNonce("pending"));

    let estFee = await super.estimateInvokeFee(calls, details);

    // FIXME: temp fix for the sepolia fee estimation
    estFee.suggestedMaxFee *= EST_FEE_MULTIPLIER;

    return estFee;
  }

  async verifyMessageHash(
    hash: BigNumberish,
    signature: Signature,
  ): Promise<boolean> {
    if (BigInt(signature[0]) === 0n) {
      return ec.starkCurve.verify(
        // @ts-expect-error TODO(#244): Adapt signature
        signature,
        BigInt(hash).toString(),
        signature[0],
      );
    }

    return super.verifyMessageHash(hash, signature);
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    return await (this.status === Status.COUNTERFACTUAL ||
    this.status === Status.DEPLOYING
      ? super.signMessage(typedData)
      : this.cartridge.signMessage()); // TODO: Fix on wasm side
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
}

export default Account;
