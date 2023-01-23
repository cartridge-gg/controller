import { CLASS_HASHES } from "@cartridge/controller/src/constants";
import { ec } from "starknet";
import {
  AccountContractDocument,
} from "generated/graphql";
import {
  constants,
  hash,
  number,
  Account as BaseAccount,
  RpcProvider,
  SignerInterface,
  Call,
  EstimateFeeDetails,
  EstimateFee,
  Signature,
} from "starknet";
import { client } from "utils/graphql";

import selectors from "./selectors";
import Storage from "./storage";
import { NamedChainId } from "@cartridge/controller/src/constants";

export enum Status {
  UNKNOWN = "UNKNOWN",
  COUNTERFACTUAL = "COUNTERFACTUAL",
  DEPLOYING = "DEPLOYING",
  DEPLOYED = "DEPLOYED",
  REGISTERING = "REGISTERING",
  REGISTERED = "REGISTERED",
}

class Account extends BaseAccount {
  private rpc: RpcProvider;
  private selector: string;
  _chainId: constants.StarknetChainId;
  updated: boolean = true;
  status: Status = Status.COUNTERFACTUAL;

  constructor(
    chainId: constants.StarknetChainId,
    nodeUrl: string,
    address: string,
    signer: SignerInterface,
  ) {
    super({ rpc: { nodeUrl } }, address, signer);
    this.rpc = new RpcProvider({ nodeUrl });
    this.selector = selectors["0.0.3"].deployment(address, chainId);
    this._chainId = chainId;
    const state = Storage.get(this.selector);

    if (!state || Date.now() - state.syncing > 5000) {
      this.sync();
      return;
    }
  }

  async getContract() {
    try {
      return await client.request(AccountContractDocument, {
        id: `starknet:${NamedChainId[this._chainId]}:${this.address}`,
      });
    } catch (e) {
      if (e.message.includes("not found")) {
        return null;
      }

      throw e;
    }
  }

  async sync() {
    Storage.update(this.selector, {
      syncing: Date.now(),
    });

    console.log("syncing")

    try {
      if (this.status === Status.COUNTERFACTUAL) {
        const registerTxnHash = Storage.get(this.selector).registerTxnHashHash;
        if (registerTxnHash) {
          this.status = Status.REGISTERING;
          Storage.update(this.selector, {
            status: Status.REGISTERING,
          });
          this.rpc
            .waitForTransaction(registerTxnHash, 1000, ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2"])
            .then(() => this.sync());
          return;
        }

        const data = await this.getContract();
        if (!data?.contract?.deployTransaction?.id) {
          this.status = Status.COUNTERFACTUAL;
          Storage.update(this.selector, {
            status: Status.DEPLOYING,
          });
          return;
        }

        const deployTxnHash = data.contract.deployTransaction.id.split("/")[1];
        const deployTxnReceipt = await this.rpc.getTransactionReceipt(deployTxnHash);

        // Pending txn so poll for inclusion.
        if (!('status' in deployTxnReceipt)) {
          this.status = Status.DEPLOYING;
          Storage.update(this.selector, {
            status: Status.DEPLOYING,
          });
          this.rpc
            .waitForTransaction(deployTxnHash, 1000, ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2"])
            .then(() => this.sync());
          return
        }

        if (deployTxnReceipt.status === "REJECTED") {
          Storage.update(this.selector, {
            status: Status.COUNTERFACTUAL,
          });
          this.status = Status.COUNTERFACTUAL;
          return;
        }
      }

      const classHash = await this.rpc.getClassHashAt(this.address, "latest");
      Storage.update(this.selector, {
        classHash,
        status: Status.DEPLOYED,
      });
      this.status = Status.DEPLOYED;

      if (classHash !== CLASS_HASHES["latest"].account) {
        this.updated = false;
      }

      const nonce = await this.rpc.getNonceForAddress(this.address, "latest");
      Storage.update(this.selector, {
        nonce,
      });

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
        "latest",
      );

      if (number.toBN(res.result[1]).eq(number.toBN(1))) {
        Storage.update(this.selector, {
          status: Status.REGISTERED,
        });
        this.status = Status.REGISTERED;
      }
    } catch (e) {
      /* no-op */
      console.log(e);
    }
  }

  async estimateInvokeFee(
    calls: Call[],
    details: EstimateFeeDetails = {},
  ): Promise<EstimateFee> {
    details.blockIdentifier = details.blockIdentifier
      ? details.blockIdentifier
      : "latest";
    return super.estimateInvokeFee(calls, details);
  }

  async verifyMessageHash(hash: string | number | import("bn.js"), signature: Signature): Promise<boolean> {
    if (number.toBN(signature[0]).cmp(number.toBN(0)) === 0) {
      const keyPair = ec.getKeyPairFromPublicKey(signature[0]);
      return ec.verify(keyPair, number.toBN(hash).toString(), signature);
    }

    super.verifyMessageHash(hash, signature);
  }

  // async getNonce(blockIdentifier?: any): Promise<number.BigNumberish> {
  //   if (
  //     blockIdentifier &&
  //     (blockIdentifier !== "latest" || blockIdentifier !== "pending")
  //   ) {
  //     return super.getNonce(blockIdentifier);
  //   }

  //   const deployment = Storage.get(this.selector);
  //   if (!deployment || !deployment.nonce) {
  //     return "0x0";
  //   }

  //   return deployment.nonce;
  // }
}

export default Account;
