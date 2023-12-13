import {
  CLASS_HASHES,
  ETH_RPC_GOERLI,
  ETH_RPC_MAINNET,
} from "@cartridge/controller/src/constants";
import {
  constants,
  hash,
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
  EstimateFeeResponse,
  InvocationsDetails,
  InvokeFunctionResponse,
  typedData,
  Invocation,
  InvocationsDetailsWithNonce,
  InvocationBulk,
} from "starknet";
import { AccountContractDocument } from "generated/graphql";
import { client } from "utils/graphql";

import selectors from "./selectors";
import Storage from "./storage";
import { RegisterData, VERSION } from "./controller";
import WebauthnAccount, { formatAssertion } from "./webauthn";

export enum Status {
  UNKNOWN = "UNKNOWN",
  COUNTERFACTUAL = "COUNTERFACTUAL",
  DEPLOYING = "DEPLOYING",
  DEPLOYED = "DEPLOYED",
  REGISTERING = "REGISTERING",
  REGISTERED = "REGISTERED",
  PENDING_REGISTER = "PENDING_REGISTER",
}

class Account extends BaseAccount {
  rpc: RpcProvider;
  private selector: string;
  _chainId: constants.StarknetChainId;
  updated: boolean = true;
  webauthn: WebauthnAccount;
  waitingForDeploy: boolean = false;

  constructor(
    chainId: constants.StarknetChainId,
    nodeUrl: string,
    address: string,
    signer: SignerInterface,
    webauthn: WebauthnAccount,
  ) {
    super({ rpc: { nodeUrl } }, address, signer);

    this.rpc = new RpcProvider({ nodeUrl });
    this.selector = selectors["0.0.3"].deployment(address, chainId);
    this._chainId = chainId;
    this.webauthn = webauthn;

    const state = Storage.get(this.selector);
    if (!state || Date.now() - state.syncing > 5000) {
      console.log("sync account");
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

  async getContract() {
    try {
      return await client.request(AccountContractDocument, {
        id: `starknet:${this._chainId}:${this.address}`,
      });
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
      if (
        this.status === Status.COUNTERFACTUAL ||
        this.status === Status.DEPLOYING
      ) {
        const registerTxnHash = Storage.get(this.selector).registerTxnHashHash;
        if (registerTxnHash) {
          this.status = Status.REGISTERING;
          this.rpc
            .waitForTransaction(
              registerTxnHash,
              Account.waitForTransactionOptions,
            )
            .then(() => this.sync());
          return;
        }

        const data = await this.getContract();
        if (!data?.contract?.deployTransaction?.id) {
          return;
        }

        const deployTxnHash = data.contract.deployTransaction.id.split("/")[1];
        const deployTxnReceipt = await this.rpc.getTransactionReceipt(
          deployTxnHash,
        );

        // Pending txn so poll for inclusion.
        if (!("execution_status" in deployTxnReceipt)) {
          this.status = Status.DEPLOYING;

          if (!this.waitingForDeploy) {
            this.rpc
              .waitForTransaction(
                deployTxnHash,
                Account.waitForTransactionOptions,
              )
              .then(() => this.sync());
            this.waitingForDeploy = true;
          }

          return;
        }

        if (deployTxnReceipt.execution_status === "REJECTED") {
          this.status = Status.COUNTERFACTUAL;
          return;
        }
      }

      if (this.status === Status.PENDING_REGISTER) {
        return;
      }

      const classHash = await this.rpc.getClassHashAt(this.address, "pending");
      Storage.update(this.selector, {
        classHash,
      });
      this.status = Status.DEPLOYED;

      if (classHash !== CLASS_HASHES["latest"].account) {
        this.updated = false;
      }

      const pub = await this.signer.getPubKey();
      const res = await this.rpc.callContract(
        {
          contractAddress: this.address,
          entrypoint: "executeOnPlugin",
          calldata: [
            CLASS_HASHES["0.0.1"].controller,
            hash.getSelector("is_public_key"),
            "0x1",
            pub,
          ],
        },
        "pending",
      );

      if (BigInt(res.result[1]) === 1n) {
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
          version: hash.transactionVersion,
        }),
      ]);
      Storage.remove(selectors[VERSION].register(this.address, this._chainId));

      this.status = Status.REGISTERED;
      Storage.update(this.selector, {
        status: Status.REGISTERED,
        nonce: (BigInt(transactionsDetail.nonce) + 2n).toString(),
      });

      this.rpc
        .waitForTransaction(responses[1].transaction_hash, 1000, [
          "ACCEPTED_ON_L1",
          "ACCEPTED_ON_L2",
        ])
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
      .waitForTransaction(res.transaction_hash, 1000, [
        "ACCEPTED_ON_L1",
        "ACCEPTED_ON_L2",
      ])
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

    const overall_fee = number.toBN("10000000");
    const fees: EstimateFee = {
      overall_fee,
      gas_consumed: number.toBN(0),
      gas_price: number.toBN("100"),
      suggestedMaxFee: overall_fee,
    };

    return fees;

    // if (this.status === Status.PENDING_REGISTER) {
    //   const pendingRegister = Storage.get(
    //     selectors[VERSION].register(this.address, this._chainId),
    //   );

    //   const nextNonce = number.toHex(
    //     number.toBN(details.nonce).add(number.toBN(1)),
    //   );
    //   const signerDetails = {
    //     walletAddress: this.address,
    //     nonce: nextNonce,
    //     maxFee: constants.ZERO,
    //     version: hash.transactionVersion,
    //     chainId: this._chainId,
    //   };

    //   const signature = await this.signer.signTransaction(calls, signerDetails);
    //   const invocation = {
    //     contractAddress: this.address,
    //     calldata: transaction.fromCallsToExecuteCalldata(calls),
    //     signature,
    //   } as Invocation;
    //   const invokeDetails = {
    //     nonce: nextNonce,
    //     maxFee: constants.ZERO,
    //     version: hash.transactionVersion,
    //   } as InvocationsDetailsWithNonce;
    //   const invocationBulk = [
    //     pendingRegister.invoke,
    //     { invocation, invokeDetails },
    //   ] as InvocationBulk;

    //   const estimates = await this.rpc.getEstimateFeeBulk(invocationBulk);

    //   const fees = estimates.reduce<EstimateFee>(
    //     (prev, estimate) => {
    //       const overall_fee = prev.overall_fee.add(
    //         number.toBN(estimate.overall_fee),
    //       );
    //       return {
    //         overall_fee: overall_fee,
    //         gas_consumed: prev.gas_consumed.add(
    //           number.toBN(estimate.gas_consumed),
    //         ),
    //         gas_price: prev.gas_price.add(number.toBN(estimate.gas_price)),
    //         suggestedMaxFee: overall_fee,
    //       };
    //     },
    //     {
    //       overall_fee: number.toBN(0),
    //       gas_consumed: number.toBN(0),
    //       gas_price: number.toBN(0),
    //       suggestedMaxFee: number.toBN(0),
    //     },
    //   );

    //   fees.suggestedMaxFee = stark.estimatedFeeToMaxFee(fees.overall_fee);

    //   return fees;
    // }

    // return super.estimateInvokeFee(calls, details);
  }

  // TODO: #223 is this still relevant?
  async verifyMessageHash(
    hash: BigNumberish,
    signature: Signature,
  ): Promise<boolean> {
    if (BigInt(signature[0]) === 0n) {
      return ec.starkCurve.verify(
        signature,
        BigInt(hash).toString(),
        signature[0],
      );
    }

    super.verifyMessageHash(hash, signature);
  }

  async signMessage(typedData: typedData.TypedData): Promise<Signature> {
    return await (this.status === Status.REGISTERED ||
    this.status === Status.COUNTERFACTUAL ||
    this.status === Status.DEPLOYING
      ? super.signMessage(typedData)
      : this.webauthn.signMessage(typedData));
  }

  async register(): Promise<RegisterData> {
    const pubKey = await this.signer.getPubKey();
    const calls: Call[] = [
      {
        contractAddress: this.address,
        entrypoint: "executeOnPlugin",
        calldata: [
          CLASS_HASHES["0.0.1"].controller,
          hash.getSelector("add_device_key"),
          1,
          pubKey,
        ],
      },
    ];

    const nonce = await this.getNonce();
    const version = hash.transactionVersion;
    const calldata = transaction.fromCallsToExecuteCalldata(calls);

    const gas = 28000n;
    const gasPrice = await getGasPrice(this._chainId);
    const fee = BigInt(gasPrice) * gas;
    const suggestedMaxFee = num.toHex(stark.estimatedFeeToMaxFee(fee));

    let msgHash = hash.calculateTransactionHash(
      this.address,
      version,
      calldata,
      suggestedMaxFee,
      this._chainId,
      nonce,
    );

    let challenge = Uint8Array.from(
      msgHash
        .slice(2)
        .padStart(64, "0")
        .slice(0, 64)
        .match(/.{1,2}/g)
        .map((byte) => parseInt(byte, 16)),
    );
    const assertion = await this.webauthn.signer.sign(challenge);
    const signature = formatAssertion(assertion);

    const invoke = {
      invocation: { contractAddress: this.address, calldata, signature },
      details: {
        nonce,
        maxFee: suggestedMaxFee,
        version,
      },
    };

    Storage.set(selectors[VERSION].register(this.address, this._chainId), {
      assertion,
      invoke,
    });

    this.status = Status.PENDING_REGISTER;
    Storage.update(this.selector, {
      status: Status.PENDING_REGISTER,
    });

    return {
      assertion,
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
      : ETH_RPC_GOERLI;
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
