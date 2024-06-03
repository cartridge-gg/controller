import {
  AsyncMethodReturns,
  connectToParent,
} from "@cartridge/penpal";
import {
  useContext,
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback,
} from "react";
import {
  ConnectReply,
  ExecuteReply,
  Policy,
  ProbeReply,
  ResponseCodes,
  Session,
  ConnectError,
} from "@cartridge/controller";
import Controller, { diff } from "utils/controller";
import {
  Abi,
  Call,
  InvocationsDetails,
  Signature,
  TypedData,
  addAddressPadding,
  constants,
} from "starknet";
import { normalize, validate } from "../methods";
import { estimateDeclareFee, estimateInvokeFee } from "../methods/estimate";
import logout from "../methods/logout";
import { revoke, session, sessions } from "../methods/sessions";
import { username } from "../methods/username";
import { useController } from "./controller";
import { Status } from "utils/account";

export type ConnectionCtx =
  | ConnectCtx
  | LogoutCtx
  | ExecuteCtx
  | SignMessageCtx;

export type ConnectCtx = {
  origin: string;
  type: "connect";
  policies: Policy[];
  resolve: (res: ConnectReply | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type LogoutCtx = {
  origin: string;
  type: "logout";
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type ExecuteCtx = {
  origin: string;
  type: "execute";
  transactions: Call | Call[];
  abis?: Abi[];
  transactionsDetail?: InvocationsDetails & {
    chainId?: constants.StarknetChainId;
  };
  resolve: (res: ExecuteReply | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type SignMessageCtx = {
  origin: string;
  type: "sign-message";
  typedData: TypedData;
  account: string;
  resolve: (signature: Signature | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

const ConnectionContext = createContext<ConnectionContextValue>(undefined);

type ConnectionContextValue = {
  controller: Controller;
  setController: (controller: Controller) => void;
  context: ConnectionCtx;
  setContext: (context: ConnectionCtx) => void;
  chainId: constants.StarknetChainId;
  close: () => void;
};

export function ConnectionProvider({ children }: PropsWithChildren) {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [chainId, setChainId] = useState<constants.StarknetChainId>(
    constants.StarknetChainId.SN_SEPOLIA,
  );
  const [controller, setController] = useController();

  useEffect(() => {
    if (typeof window === "undefined" || window.self === window.top) {
      return;
    }

    const connection = connectToParent({
      methods: {
        connect: normalize(
          (origin: string) =>
            async (
              policies: Policy[],
              chainId?: constants.StarknetChainId,
            ): Promise<ConnectReply> => {
              return await new Promise((resolve, reject) => {
                if (chainId) {
                  setChainId(chainId);
                }
                setContext({
                  type: "connect",
                  origin,
                  policies,
                  resolve,
                  reject,
                } as ConnectCtx);
              });
            },
        ),
        disconnect: normalize(
          validate((controller: Controller, _origin: string) => () => {
            controller.delete();
            setController(undefined);
          }),
        ),
        execute: normalize(
          validate(
            (controller: Controller, origin: string) =>
              async (
                transactions: Call | Call[],
                abis?: Abi[],
                transactionsDetail?: InvocationsDetails & {
                  chainId?: constants.StarknetChainId;
                },
                sync?: boolean,
              ): Promise<ExecuteReply | ConnectError> => {
                const cId = transactionsDetail?.chainId
                  ? transactionsDetail.chainId
                  : chainId;
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
                const account = controller.account(cId);
                if (account.status === Status.DEPLOYING) {
                  return Promise.resolve({
                    code: ResponseCodes.NOT_ALLOWED,
                    message: "Account is deploying.",
                  });
                }

                const calls = Array.isArray(transactions)
                  ? transactions
                  : [transactions];
                const policies = calls.map(
                  (txn) =>
                  ({
                    target: addAddressPadding(txn.contractAddress),
                    method: txn.entrypoint,
                  } as Policy),
                );

                const session = controller.session(origin, cId);
                if (!session) {
                  return Promise.resolve({
                    code: ResponseCodes.NOT_ALLOWED,
                    message: `No session`,
                  });
                }

                const missing = diff(policies, session.policies);
                if (missing.length > 0) {
                  return Promise.resolve({
                    code: ResponseCodes.NOT_ALLOWED,
                    message: `Missing policies: ${JSON.stringify(missing)}`,
                  });
                }

                if (!transactionsDetail.maxFee) {
                  try {
                    const estFee = await account.estimateInvokeFee(calls, {
                      nonce: transactionsDetail.nonce,
                    });

                    transactionsDetail.maxFee = estFee.suggestedMaxFee;
                  } catch (e) {
                    return Promise.resolve({
                      code: ResponseCodes.NOT_ALLOWED,
                      message: e.message,
                    });
                  }
                }

                if (
                  session.maxFee &&
                  transactionsDetail &&
                  BigInt(transactionsDetail.maxFee) > BigInt(session.maxFee)
                ) {
                  return Promise.resolve({
                    code: ResponseCodes.NOT_ALLOWED,
                    message: `Max fee exceeded: ${transactionsDetail.maxFee.toString()} > ${session.maxFee.toString()}`,
                  });
                }

                try {
                  const res = await account.execute(
                    calls,
                    session,
                    transactionsDetail,
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
              },
          ),
        ),
        estimateDeclareFee: normalize(validate(estimateDeclareFee)),
        estimateInvokeFee: normalize(validate(estimateInvokeFee)),
        logout: normalize(logout),
        probe: normalize(
          validate(
            (controller: Controller, origin: string) => (): ProbeReply => {
              const session = controller.session(origin, chainId);
              return {
                code: ResponseCodes.SUCCESS,
                address: controller.address,
                policies: session?.policies || [],
              };
            },
          ),
        ),
        revoke: normalize(revoke),
        signMessage: normalize(
          validate(
            (_: Controller, origin: string) =>
              async (typedData: TypedData, account: string) => {
                return await new Promise((resolve, reject) => {
                  setContext({
                    type: "sign-message",
                    origin,
                    typedData,
                    account,
                    resolve,
                    reject,
                  } as SignMessageCtx);
                });
              },
          ),
        ),
        session: normalize(
          (origin: string) => async (): Promise<Session> =>
            await new Promise(() => session(origin, chainId)),
        ),
        sessions: normalize(sessions),
        reset: normalize(() => () => setContext(undefined)),
        username: normalize(username),
      },
    });

    connection.promise.then(parent => setParent(parent as unknown as ParentMethods))

    return () => {
      connection.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(async () => {
    if (!parent) return

    try {
      await parent.close();
    } catch (e) {
      // Always fails for some reason
    }
  }, [parent]);

  return (
    <ConnectionContext.Provider
      value={{
        controller,
        setController,
        chainId,
        context,
        setContext,
        close,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>

export function useConnection() {
  const ctx = useContext<ConnectionContextValue>(ConnectionContext);
  if (!ctx) {
    throw new Error("ConnectionProvider must be placed");
  }

  return ctx;
}
