import { Policy, MissingPolicys, Session } from "@cartridge/controller";
import {
  constants,
  hash,
  number,
  transaction,
  Call,
  Abi,
  InvocationsDetails,
  InvokeFunctionResponse,
} from "starknet";

import Controller, { diff } from "utils/controller";
import Storage from "utils/storage";

const execute =
  (controller: Controller, session: Session) =>
  async (
    transactions: Call | Call[],
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails & {
      chainId?: constants.StarknetChainId;
    },
    sync?: boolean,
  ): Promise<InvokeFunctionResponse> => {
    transactionsDetail.chainId = transactionsDetail.chainId
      ? transactionsDetail.chainId
      : constants.StarknetChainId.TESTNET;

    if (!controller.account(transactionsDetail.chainId).registered) {
      throw new Error("not registered");
    }

    const calls = Array.isArray(transactions) ? transactions : [transactions];

    const policies = calls.map(
      (txn) =>
        ({
          target: txn.contractAddress,
          method: txn.entrypoint,
        } as Policy),
    );

    if (!transactionsDetail.nonce) {
      transactionsDetail.nonce = await controller
        .account(transactionsDetail.chainId)
        .getNonce();
    }

    transactionsDetail.version = hash.transactionVersion;

    if (sync) {
      const calldata = transaction.fromCallsToExecuteCalldata(calls);
      const h = hash.calculateTransactionHash(
        controller.address,
        transactionsDetail.version,
        calldata,
        transactionsDetail.maxFee,
        transactionsDetail.chainId,
        transactionsDetail.nonce,
      );
      await pollForTransaction(h);
    } else {
      const missing = diff(policies, session.policies);
      if (missing.length > 0) {
        throw new MissingPolicys(missing);
      }
    }

    if (!transactionsDetail.maxFee) {
      try {
        transactionsDetail.maxFee = (
          await controller
            .account(transactionsDetail.chainId)
            .estimateInvokeFee(calls, { nonce: transactionsDetail.nonce })
        ).suggestedMaxFee;
      } catch (e) {
        console.error(e);
        throw e;
      }
    }

    if (
      session.maxFee &&
      transactionsDetail &&
      number.toBN(transactionsDetail.maxFee).gt(number.toBN(session.maxFee))
    ) {
      throw new Error("transaction fees exceed pre-approved limit");
    }

    return await controller
      .account(transactionsDetail.chainId)
      .execute(calls, abis, transactionsDetail);
  };

// Three minutes
const TIMEOUT = 1000 * 60 * 3;
const INTERVAL = 100;

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
    const timeout = setInterval(checkApproval, INTERVAL);

    // Call on leading edge
    checkApproval();
  });
}

export default execute;
