import { Policy, MissingPolicys, Session } from "@cartridge/controller";
import {
  Call,
  Abi,
  InvocationsDetails,
  InvokeFunctionResponse,
} from "starknet";
import { StarknetChainId } from "starknet/constants";
import { toBN } from "starknet/utils/number";
import { calculateTransactionHash } from "starknet/utils/hash";
import { fromCallsToExecuteCalldata } from "starknet/utils/transaction";

import Controller, { diff } from "utils/controller";
import Storage from "utils/storage";

const execute =
  (controller: Controller, session: Session) =>
    async (
      transactions: Call | Call[],
      abis?: Abi[],
      transactionsDetail?: InvocationsDetails & {
        chainId?: StarknetChainId,
      },
      sync?: boolean,
    ): Promise<InvokeFunctionResponse> => {
      const calls = Array.isArray(transactions) ? transactions : [transactions];

      const policies = calls.map(
        (txn) =>
        ({
          target: txn.contractAddress,
          method: txn.entrypoint,
        } as Policy),
      );

      // if (!transactionsDetail.nonce) {
      //   transactionsDetail.nonce = await this.getNonce();
      // }

      transactionsDetail.chainId = transactionsDetail.chainId ? transactionsDetail.chainId : StarknetChainId.TESTNET
      transactionsDetail.version = 1;

      // if (!transactionsDetail.maxFee) {
      //   try {
      //     transactionsDetail.maxFee = (await this.estimateInvokeFee(calls, { nonce: transactionsDetail.nonce })).suggestedMaxFee
      //   } catch (e) {
      //     console.error(e)
      //     throw e
      //   }
      // }

      if (sync) {
        const calldata = fromCallsToExecuteCalldata(calls);
        const hash = calculateTransactionHash(
          controller.address,
          transactionsDetail.version,
          calldata,
          transactionsDetail.maxFee,
          transactionsDetail.chainId,
          transactionsDetail.nonce,
        );
        await pollForTransaction(hash);
      } else {
        const missing = diff(policies, session.policies);
        if (missing.length > 0) {
          throw new MissingPolicys(missing);
        }
      }

      if (
        session.maxFee &&
        transactionsDetail &&
        toBN(transactionsDetail.maxFee).gt(toBN(session.maxFee))
      ) {
        throw new Error("transaction fees exceed pre-approved limit");
      }

      return await controller.account(transactionsDetail.chainId).execute(calls, abis, transactionsDetail);
    };

// Three minutes
const TIMEOUT = 1000 * 60 * 3;
const INTERNVAL = 100;

function pollForTransaction(hash: string) {
  return new Promise((resolve, reject) => {
    let elapsed = -100;
    const checkApproval = async () => {
      elapsed += 100;

      if (elapsed > TIMEOUT) {
        clearInterval(timeout);
        return reject("timeout");
      }

      const txn = Storage.get(hash);
      if (txn) {
        Storage.remove(hash);
        clearInterval(timeout);
        return resolve("");
      }
    };

    // Poll for approval
    const timeout = setInterval(checkApproval, INTERNVAL);

    // Call on leading edge
    checkApproval();
  });
}

export default execute;
