import {
  ExecuteReply,
  ResponseCodes,
  ConnectError,
  PaymasterOptions,
} from "@cartridge/controller";
import Controller from "utils/controller";
import {
  Abi,
  AllowArray,
  Call,
  CallData,
  InvocationsDetails,
  addAddressPadding,
  num,
} from "starknet";
import Account from "utils/account";
import { ConnectionCtx, ExecuteCtx } from "./types";

export const ESTIMATE_FEE_PERCENTAGE = 10;

export function executeFactory({
  setContext,
}: {
  setContext: (context: ConnectionCtx) => void;
}) {
  return (controller: Controller, origin: string) =>
    async (
      transactions: AllowArray<Call>,
      abis: Abi[],
      transactionsDetail?: InvocationsDetails,
      sync?: boolean,
      paymaster?: PaymasterOptions,
    ): Promise<ExecuteReply | ConnectError> => {
      if (sync) {
        return await new Promise((resolve, reject) => {
          setContext({
            type: "execute",
            origin,
            transactions,
            abis,
            transactionsDetail,
            resolve,
            reject,
          } as ExecuteCtx);
        });
      }

      try {
        const account = controller.account;
        const calls = normalizeCalls(transactions);

        if (!account.hasSession(calls)) {
          throw new Error(`No session available`);
        }

        if (paymaster) {
          const res = await tryPaymaster(account, calls, paymaster);
          if (res) return res;
        }

        const { nonce, maxFee } = await getInvocationDetails(
          transactionsDetail,
          account,
          calls,
        );

        const res = await account.execute(transactions, { nonce, maxFee });

        return {
          code: ResponseCodes.SUCCESS,
          ...res,
        };
      } catch (e) {
        return {
          code: ResponseCodes.NOT_ALLOWED,
          message: e.message,
        };
      }
    };
}

export const normalizeCalls = (calls: AllowArray<Call>): Call[] => {
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
    return {
      entrypoint: call.entrypoint,
      contractAddress: addAddressPadding(call.contractAddress),
      calldata: CallData.toHex(call.calldata),
    } as Call;
  });
};

async function tryPaymaster(
  account: Account,
  calls: Call[],
  paymaster: PaymasterOptions,
): Promise<ExecuteReply> {
  try {
    const transaction_hash = await account.cartridge.executeFromOutside(
      calls,
      paymaster.caller,
    );

    return {
      code: ResponseCodes.SUCCESS,
      transaction_hash,
    };
  } catch (e) {
    /* user pays */
  }
}

async function getInvocationDetails(
  details: InvocationsDetails,
  account: Account,
  calls: Call[],
): Promise<InvocationsDetails> {
  let { nonce, maxFee } = details;

  nonce = nonce ?? (await account.getNonce("pending"));

  if (!maxFee) {
    await account.ensureDeployed();

    const estFee = await account.cartridge.estimateInvokeFee(calls);

    maxFee = num.toHex(
      num.addPercent(estFee.overall_fee, ESTIMATE_FEE_PERCENTAGE),
    );
  }

  // if (session.maxFee && BigInt(maxFee) > BigInt(session.maxFee)) {
  //   throw new Error(
  //     `Max fee exceeded: ${maxFee.toString()} > ${session.maxFee.toString()}`,
  //   );
  // }

  return { nonce, maxFee };
}
