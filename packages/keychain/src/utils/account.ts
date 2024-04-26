import {
  constants,
  Account as BaseAccount,
  RpcProvider,
  SignerInterface,
  Call,
  EstimateFeeDetails,
  EstimateFee,
  Signature,
  transaction,
  stark,
  Abi,
  AllowArray,
  ec,
  InvokeFunctionResponse,
  TypedData,
  BigNumberish,
  waitForTransactionOptions,
  num,
  TransactionFinalityStatus,
  InvocationsDetails,
  // AccountInvocationItem,
  // TransactionType,
} from "starknet";
import {
  AccountContractDocument,
  AccountContractQuery,
} from "generated/graphql";
import { client } from "utils/graphql";

import selectors from "./selectors";
import Storage from "./storage";
// import { InvocationWithDetails, RegisterData, VERSION } from "./controller";
import { WebauthnAccount } from "@cartridge/account-wasm";

export enum Status {
  COUNTERFACTUAL = "COUNTERFACTUAL",
  DEPLOYING = "DEPLOYING",
  DEPLOYED = "DEPLOYED",
}

class Account extends BaseAccount {
  rpc: RpcProvider;
  private selector: string;
  _chainId: constants.StarknetChainId;
  updated: boolean = true;
  webauthn: WebauthnAccount;

  constructor(
    chainId: constants.StarknetChainId,
    nodeUrl: string,
    address: string,
    signer: SignerInterface,
    webauthn: WebauthnAccount,
  ) {
    super({ nodeUrl }, address, signer);

    this.rpc = new RpcProvider({ nodeUrl });
    this.selector = selectors["0.0.3"].deployment(address, chainId);
    this._chainId = chainId;
    this.webauthn = webauthn;
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
    let chainId = this._chainId.substring(2);
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
    console.log("sync");
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
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
  ): Promise<InvokeFunctionResponse> {
    if (this.status === Status.COUNTERFACTUAL) {
      throw new Error("Account is not deployed");
    }

    transactionsDetail.nonce =
      transactionsDetail.nonce ?? (await this.getNonce("pending"));

    const res = await super.execute(calls, abis, transactionsDetail);
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

    return super.estimateInvokeFee(calls, details);
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
      : this.webauthn.signMessage()); // TODO: Fix on wasm side
  }

  // async register() {
  //   const pubKey = await this.signer.getPubKey();
  //   const calls: Call[] = [
  //     {
  //       contractAddress: this.address,
  //       entrypoint: "set_public_key",
  //       calldata: [pubKey],
  //     },
  //   ];

  //   const nonce = await this.getNonce("pending");
  //   const version = "0x1";

  //   const gas = 100000n;
  //   const gasPrice = await getGasPrice(this._chainId);
  //   const fee = BigInt(gasPrice) * gas;
  //   const maxFee = num.toHex(stark.estimatedFeeToMaxFee(fee));

  //   try {
  //     const signature = await this.webauthn.signTransaction(calls, {
  //       maxFee,
  //       version,
  //       nonce,
  //     });

  //     const { transaction_hash } = await this.invokeFunction(
  //       {
  //         contractAddress: this.address,
  //         calldata: transaction.fromCallsToExecuteCalldata_cairo1(calls),
  //         signature,
  //       },
  //       {
  //         maxFee,
  //         version,
  //         nonce,
  //       },
  //     );

  //     await this.rpc.waitForTransaction(transaction_hash, {
  //       retryInterval: 1000,
  //       successStates: [
  //         TransactionFinalityStatus.ACCEPTED_ON_L1,
  //         TransactionFinalityStatus.ACCEPTED_ON_L2,
  //       ],
  //     });

  //     this.status = Status.REGISTERING;
  //     Storage.update(this.selector, {
  //       status: Status.REGISTERING,
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

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

// async function getGasPrice(chainId: constants.StarknetChainId) {
//   const uri =
//     chainId === constants.StarknetChainId.SN_MAIN
//       ? ETH_RPC_MAINNET
//       : ETH_RPC_SEPOLIA;
//   const response = await fetch(uri, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       jsonrpc: "2.0",
//       method: "eth_gasPrice",
//       params: [],
//       id: 1,
//     }),
//   });
//   const data = await response.json();
//   return data.result;
// }

// const hash = await this.rpc
//   .invokeFunction(invoke, {
//     maxFee,
//     version,
//     nonce,
//   })
//   .catch((e) => {
//     console.error(e);
//   });

// console.log(hash);
// let txHash = hash.calculateInvokeTransactionHash({
//   senderAddress: this.address,
//   version,
//   compiledCalldata: transaction.fromCallsToExecuteCalldata_cairo1(calls),
//   maxFee,
//   chainId: this._chainId,
//   nonce,
// });

// let res = await this.rpc
//   .callContract({
//     contractAddress: this.address,
//     entrypoint: "verify_webauthn_signer",
//     calldata: [...signature, txHash],
//   })
//   .catch((e) => {
//     console.error(e);
//   });
