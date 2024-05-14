import {
  constants,
  Account as BaseAccount,
  RpcProvider,
  SignerInterface,
  Call,
  EstimateFeeDetails,
  EstimateFee,
  Signature,
  Abi,
  AllowArray,
  ec,
  InvokeFunctionResponse,
  TypedData,
  BigNumberish,
  waitForTransactionOptions,
  TransactionFinalityStatus,
  InvocationsDetails,
} from "starknet";
import {
  AccountContractDocument,
  AccountContractQuery,
} from "generated/graphql";
import { client } from "utils/graphql";

import selectors from "./selectors";
import Storage from "./storage";
import { CartridgeAccount } from "@cartridge/account-wasm";

export enum Status {
  COUNTERFACTUAL = "COUNTERFACTUAL",
  DEPLOYING = "DEPLOYING",
  DEPLOYED = "DEPLOYED",
}

class Account extends BaseAccount {
  rpc: RpcProvider;
  private selector: string;
  chainId: constants.StarknetChainId;
  updated: boolean = true;
  cartridge: CartridgeAccount;

  constructor(
    chainId: constants.StarknetChainId,
    nodeUrl: string,
    address: string,
    signer: SignerInterface,
    cartridge: CartridgeAccount,
  ) {
    super({ nodeUrl }, address, signer);

    this.rpc = new RpcProvider({ nodeUrl });
    this.selector = selectors["0.0.1"].deployment(address, chainId);
    this.chainId = chainId;
    this.cartridge = cartridge;

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
            "latest",
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
      console.log(e);
    }
  }

  // @ts-expect-error TODO: fix overload type mismatch
  async execute(
    calls: AllowArray<Call>,
    _abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
  ): Promise<InvokeFunctionResponse> {
    if (this.status === Status.COUNTERFACTUAL) {
      throw new Error("Account is not deployed");
    }

    transactionsDetail.nonce =
      transactionsDetail.nonce ?? (await this.getNonce("pending"));
    // FIXME: estimated max fee is always too low
    //transactionsDetail.maxFee = num.toHex(transactionsDetail.maxFee);
    transactionsDetail.maxFee = "0x38D7EA4C68000"; // 0.001 eth

    const res = await this.cartridge.execute(
      calls as Array<Call>,
      transactionsDetail,
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

    return await super.estimateInvokeFee(calls, details);
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
    if (blockIdentifier && blockIdentifier !== "pending") {
      return super.getNonce(blockIdentifier);
    }

    const chainNonce = await super.getNonce("latest");
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
