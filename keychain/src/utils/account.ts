import { CLASS_HASHES } from "@cartridge/controller/src/constants";
import { ec } from "starknet";
import {
  constants,
  hash,
  number,
  transaction,
  Account as BaseAccount,
  RpcProvider,
  SignerInterface,
  Call,
  EstimateFeeDetails,
  EstimateFee,
  GetTransactionReceiptResponse,
  Signature,
} from "starknet";

import selectors from "./selectors";
import Storage from "./storage";

class Account extends BaseAccount {
  private rpc: RpcProvider;
  private selector: string;
  deployed: boolean = false;
  registered: boolean = false;
  updated: boolean = true;

  constructor(
    chainId: constants.StarknetChainId,
    nodeUrl: string,
    address: string,
    signer: SignerInterface,
  ) {
    super({ rpc: { nodeUrl } }, address, signer);
    this.rpc = new RpcProvider({ nodeUrl });
    this.selector = selectors["0.0.3"].deployment(address, chainId);
    const state = Storage.get(this.selector);

    if (state) {
      this.deployed = !!state.deployed;
      this.registered = !!state.registered;
    }

    if (!state || Date.now() - state.syncing > 5000) {
      this.sync();
      return;
    }
  }

  async sync() {
    Storage.update(this.selector, {
      syncing: Date.now(),
    });

    try {
      if (!this.deployed || !this.registered) {
        const txn = Storage.get(this.selector).txnHash;
        if (txn) {
          await this.rpc.waitForTransaction(txn, 8000, [
            "ACCEPTED_ON_L1",
            "ACCEPTED_ON_L2",
          ]);
        }
      }

      const classHash = await this.rpc.getClassHashAt(this.address, "latest");
      Storage.update(this.selector, {
        classHash,
        deployed: true,
      });
      this.deployed = true;

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

      this.registered = number.toBN(res.result[1]).eq(number.toBN(1));
      Storage.update(this.selector, {
        registered: this.registered,
      });
    } catch (e) {
      /* no-op */
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
