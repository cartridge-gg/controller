import {
  CLASS_HASHES,
  ETH_RPC_SEPOLIA,
  ETH_RPC_MAINNET,
} from "@cartridge/controller/src/constants";
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
  InvocationsDetails,
  InvokeFunctionResponse,
  typedData,
  BigNumberish,
  waitForTransactionOptions,
  num,
  TransactionFinalityStatus,
  AccountInvocationItem,
  TransactionType,
} from "starknet";
import {
  AccountContractDocument,
  AccountContractQuery,
} from "generated/graphql";
import { client } from "utils/graphql";

import selectors from "./selectors";
import Storage from "./storage";
import { InvocationWithDetails, RegisterData, VERSION } from "./controller";
import { WebauthnAccount } from "@cartridge/account-wasm";

export enum Status {
  UNKNOWN = "UNKNOWN",
  COUNTERFACTUAL = "COUNTERFACTUAL",
  DEPLOYING = "DEPLOYING",
  DEPLOYED = "DEPLOYED",
  REGISTERING = "REGISTERING",
  REGISTERED = "REGISTERED",
  PENDING_REGISTER = "PENDING_REGISTER",
  REJECTED = "REJECTED",
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

  async getDeploymentTxn() {
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
        return null;
      }

      throw e;
    }
  }

  async sync() {
    console.log("sync");
    Storage.update(this.selector, {
      syncing: Date.now(),
    });

    try {
      switch (this.status) {
        case Status.DEPLOYING:
        case Status.COUNTERFACTUAL:
          const hash = await this.getDeploymentTxn();
          const receipt = await this.rpc.getTransactionReceipt(hash);
          if (receipt.isRejected()) {
            // TODO: Handle redeployment
            this.status = Status.REJECTED;
            return;
          }
          break;
        case Status.DEPLOYED:
        case Status.REGISTERED:
        case Status.PENDING_REGISTER:
          return;
      }

      const classHash = await this.rpc.getClassHashAt(this.address, "latest");
      Storage.update(this.selector, {
        classHash,
      });
      this.status = Status.DEPLOYED;

      const pub = await this.signer.getPubKey();
      const res = await this.rpc.callContract(
        {
          contractAddress: this.address,
          entrypoint: "get_public_key",
        },
        "latest",
      );

      if (res[0] === pub) {
        this.status = Status.REGISTERED;
      }
    } catch (e) {
      /* no-op */
      console.log(e);
    }
  }

  async execute(
    calls: AllowArray<Call>,
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
  ): Promise<InvokeFunctionResponse> {
    if (this.status === Status.COUNTERFACTUAL) {
      throw new Error("Account is not deployed");
    }

    transactionsDetail.nonce =
      transactionsDetail.nonce ?? (await this.getNonce());

    if (this.status === Status.PENDING_REGISTER) {
      const pendingRegister = Storage.get(
        selectors[VERSION].register(this.address, this._chainId),
      ) as RegisterData;

      const responses = await Promise.all([
        this.invokeFunction(pendingRegister.invoke.invocation, {
          ...pendingRegister.invoke.details,
          nonce: pendingRegister.invoke.details.nonce!,
        }),
        super.execute(calls, null, {
          maxFee: transactionsDetail.maxFee,
          nonce: BigInt(transactionsDetail.nonce) + 1n,
          version: 1n,
        }),
      ]);
      Storage.remove(selectors[VERSION].register(this.address, this._chainId));

      this.status = Status.REGISTERED;
      Storage.update(this.selector, {
        status: Status.REGISTERED,
        nonce: (BigInt(transactionsDetail.nonce) + 2n).toString(),
      });

      this.rpc
        .waitForTransaction(responses[1].transaction_hash, {
          retryInterval: 1000,
          successStates: [
            TransactionFinalityStatus.ACCEPTED_ON_L1,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        })
        .catch(() => {
          this.resetNonce();
        });

      return responses[1];
    }

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

    details.nonce = details.nonce ?? (await super.getNonce("latest"));

    if (this.status === Status.PENDING_REGISTER) {
      const pendingRegister = Storage.get(
        selectors[VERSION].register(this.address, this._chainId),
      );
      const registerInvocation: AccountInvocationItem = {
        type: TransactionType.INVOKE,
        ...pendingRegister.invoke.invocation,
        ...pendingRegister.invoke.details,
      };

      const nextNonce = num.toHex(BigInt(details.nonce) + 1n);
      const signature = await this.signer.signTransaction(calls, {
        walletAddress: this.address,
        chainId: this._chainId,
        cairoVersion: this.cairoVersion,
        nonce: nextNonce,
        maxFee: constants.ZERO,
        version: "0x1",
      });
      const invocation: AccountInvocationItem = {
        type: TransactionType.INVOKE,
        contractAddress: this.address,
        calldata: transaction.fromCallsToExecuteCalldata_cairo1(calls),
        signature,
        nonce: nextNonce,
        maxFee: constants.ZERO,
        version: "0x1",
      };

      const estimates = await this.rpc.getEstimateFeeBulk(
        [registerInvocation, invocation],
        {},
      );

      const fees = estimates.reduce<EstimateFee>(
        (prev, estimate) => {
          const overall_fee = prev.overall_fee + estimate.overall_fee;
          return {
            ...prev,
            overall_fee: overall_fee,
            gas_consumed: prev.gas_consumed + estimate.gas_consumed,
            gas_price: prev.gas_price + estimate.gas_price,
            suggestedMaxFee: overall_fee,
            // TODO(#244): Set resource bounds
            resourceBounds: {
              l1_gas: {
                max_amount: "",
                max_price_per_unit: "",
              },
              l2_gas: {
                max_amount: "",
                max_price_per_unit: "",
              },
            },
          };
        },
        {
          overall_fee: 0n,
          gas_consumed: 0n,
          gas_price: 0n,
          suggestedMaxFee: 0n,
          unit: "WEI",
          resourceBounds: {
            l1_gas: {
              max_amount: "",
              max_price_per_unit: "",
            },
            l2_gas: {
              max_amount: "",
              max_price_per_unit: "",
            },
          },
        },
      );

      fees.suggestedMaxFee = stark.estimatedFeeToMaxFee(fees.overall_fee);

      return fees;
    }

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

  async signMessage(typedData: typedData.TypedData): Promise<Signature> {
    return await (this.status === Status.REGISTERED ||
    this.status === Status.COUNTERFACTUAL ||
    this.status === Status.DEPLOYING
      ? super.signMessage(typedData)
      : this.webauthn.signMessage()); // TODO: Fix on wasm side
  }

  async register(): Promise<RegisterData> {
    const pubKey = await this.signer.getPubKey();
    const calls: Call[] = [
      {
        contractAddress: this.address,
        entrypoint: "set_public_key",
        calldata: [pubKey],
      },
    ];

    const nonce = await this.getNonce();
    const version = "0x1";

    const gas = 100000n;
    const gasPrice = await getGasPrice(this._chainId);
    const fee = BigInt(gasPrice) * gas;
    const maxFee = num.toHex(stark.estimatedFeeToMaxFee(fee));

    const signature = await this.webauthn
      .signTransaction(calls, {
        maxFee,
        version,
        nonce,
      })
      .catch((e) => {
        console.error(e);
      });

    const invoke: InvocationWithDetails = {
      invocation: {
        contractAddress: this.address,
        calldata: transaction.fromCallsToExecuteCalldata_cairo1(calls),
        signature,
      },
      details: {
        maxFee,
        version,
        nonce,
      },
    };

    Storage.set(selectors[VERSION].register(this.address, this._chainId), {
      invoke,
    });

    this.status = Status.PENDING_REGISTER;
    Storage.update(this.selector, {
      status: Status.PENDING_REGISTER,
    });

    return {
      invoke,
    };
  }

  async getNonce(blockIdentifier?: any): Promise<string> {
    if (blockIdentifier && blockIdentifier !== "pending") {
      return super.getNonce(blockIdentifier);
    }

    const chainNonce = await super.getNonce("pending");
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

async function getGasPrice(chainId: constants.StarknetChainId) {
  const uri =
    chainId === constants.StarknetChainId.SN_MAIN
      ? ETH_RPC_MAINNET
      : ETH_RPC_SEPOLIA;
  const response = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1,
    }),
  });
  const data = await response.json();
  return data.result;
}

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
