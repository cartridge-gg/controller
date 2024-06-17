import {
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
  TransactionFinalityStatus,
  InvocationsDetails,
  num,
  TransactionExecutionStatus,
  shortString,
  stark,
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
import { VERSION } from "./controller";

const EST_FEE_MULTIPLIER = 10n;

export enum Status {
  COUNTERFACTUAL = "COUNTERFACTUAL",
  DEPLOYING = "DEPLOYING",
  DEPLOYED = "DEPLOYED",
}

class Account extends BaseAccount {
  rpc: RpcProvider;
  private selector: string;
  chainId: string;
  username: string;
  cartridge: CartridgeAccount;

  constructor(
    chainId: string,
    nodeUrl: string,
    address: string,
    username: string,
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
    this.selector = selectors[VERSION].deployment(address, chainId);
    this.chainId = chainId;
    this.username = username;
    this.cartridge = CartridgeAccount.new(
      nodeUrl,
      chainId,
      address,
      webauthn.rpId,
      webauthn.origin,
      webauthn.credentialId,
      webauthn.publicKey,
    );

    this.sync();
  }

  get status() {
    const state = Storage.get(this.selector);
    if (!state || !state.status) {
      return Status.DEPLOYING;
    }

    return state.status;
  }

  set status(status: Status) {
    Storage.update(this.selector, {
      status,
    });
  }

  async requestDeployment(): Promise<void> {
    await client.request(AccountContractDocument, {
      id: this.username,
      chainId: `starknet:${shortString.decodeShortString(this.chainId)}`,
    });

    this.status = Status.DEPLOYING;
  }

  async getDeploymentTxn(): Promise<string | undefined> {
    try {
      const data: AccountContractQuery = await client.request(
        AccountContractDocument,
        {
          id: `starknet:${shortString.decodeShortString(this.chainId)}:${
            this.address
          }`,
        },
      );

      if (!data?.contract?.deployTransactionID) {
        throw new Error("deployment txn not found");
      }

      return data.contract.deployTransactionID.split("/")[1];
    } catch (e) {
      if (e.message.includes("not found")) {
        return Promise.resolve(undefined);
      }

      return Promise.reject(e);
    }
  }

  async sync() {
    try {
      switch (this.status) {
        case Status.DEPLOYING: {
          const hash = await this.getDeploymentTxn();
          if (!hash) {
            this.status = Status.COUNTERFACTUAL;
            return;
          }

          const receipt = await this.rpc.getTransactionReceipt(hash);
          if (receipt.isReverted() || receipt.isRejected()) {
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

    const res = await this.cartridge.execute(
      calls as Array<Call>,
      transactionsDetail,
      session,
    );

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
        errorStates: [
          TransactionExecutionStatus.REJECTED,
          TransactionExecutionStatus.REVERTED,
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
}

export default Account;
