import {
  ExecuteReply,
  Policy,
  ResponseCodes,
  ConnectError,
  PaymasterOptions,
  Session,
} from "@cartridge/controller";
import Controller, { diff } from "utils/controller";
import {
  Abi,
  AllowArray,
  Call,
  CallData,
  InvocationsDetails,
  addAddressPadding,
} from "starknet";
import Account, { Status } from "utils/account";
import { ConnectionCtx, ExecuteCtx } from "./types";

const ESTIMATE_FEE_MULTIPLIER = 1.1;

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
        if (account.status !== Status.DEPLOYED) {
          throw new Error("Account is deploying.");
        }

        const session = controller.session(origin);
        if (!session) {
          throw new Error("No session");
        }

        const missing = diff(mapPolicies(transactions), session.policies);
        if (missing.length > 0) {
          throw new Error(`Missing policies: ${JSON.stringify(missing)}`);
        }

        const calls = normalizeCalls(transactions);

        if (paymaster) {
          const res = await tryPaymaster(account, calls, paymaster, session);
          if (res) return res;
        }

        const { nonce, maxFee } = await getInvocationDetails(
          transactionsDetail,
          account,
          calls,
          session,
        );

        const res = await account.execute(
          transactions,
          { nonce, maxFee },
          session,
        );

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

export const mapPolicies = (calls: AllowArray<Call>): Policy[] => {
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
    return {
      target: addAddressPadding(call.contractAddress),
      method: call.entrypoint,
    } as Policy;
  });
};

async function tryPaymaster(
  account: Account,
  calls: Call[],
  paymaster: PaymasterOptions,
  session: Session,
): Promise<ExecuteReply> {
  try {
    const { transaction_hash } = await account.cartridge.executeFromOutside(
      calls,
      paymaster.caller,
      session,
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
  session: Session,
): Promise<InvocationsDetails> {
  let { nonce, maxFee } = details;

  nonce = nonce ?? (await account.getNonce("pending"));

  if (!maxFee) {
    const estFee = await account.cartridge.estimateInvokeFee(
      calls,
      session,
      ESTIMATE_FEE_MULTIPLIER,
    );

    maxFee = estFee.overall_fee;
  }

  if (session.maxFee && BigInt(maxFee) > BigInt(session.maxFee)) {
    throw new Error(
      `Max fee exceeded: ${maxFee.toString()} > ${session.maxFee.toString()}`,
    );
  }

  return { nonce, maxFee };
}
