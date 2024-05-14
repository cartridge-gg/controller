import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { connectToParent } from "@cartridge/penpal";
import Controller, { diff } from "utils/controller";
import {
  ConnectReply,
  Error,
  ResponseCodes,
  ExecuteReply,
  Policy,
  Session,
  ProbeReply,
} from "@cartridge/controller";
import {
  Abi,
  Call,
  constants,
  InvocationsDetails,
  Signature,
  TypedData,
} from "starknet";
import { estimateDeclareFee, estimateInvokeFee } from "../methods/estimate";
import provision from "../methods/provision";
import { register } from "../methods/register";
import logout from "../methods/logout";
import { revoke, session, sessions } from "../methods/sessions";
import { normalize, validate } from "../methods";
import {
  Connect,
  Execute,
  Login,
  Logout,
  SignMessage,
  Signup,
} from "components";
import { useController } from "hooks/controller";

type Context = Connect | Logout | Execute | SignMessage;

export type Connect = {
  origin: string;
  type: "connect";
  policies: Policy[];
  resolve: (res: ConnectReply | Error) => void;
  reject: (reason?: unknown) => void;
};

type Logout = {
  origin: string;
  type: "logout";
  resolve: (res: Error) => void;
  reject: (reason?: unknown) => void;
};

type Execute = {
  origin: string;
  type: "execute";
  transactions: Call | Call[];
  abis?: Abi[];
  transactionsDetail?: InvocationsDetails & {
    chainId?: constants.StarknetChainId;
  };
  resolve: (res: ExecuteReply | Error) => void;
  reject: (reason?: unknown) => void;
};

type SignMessage = {
  origin: string;
  type: "sign-message";
  typedData: TypedData;
  account: string;
  resolve: (signature: Signature | Error) => void;
  reject: (reason?: unknown) => void;
};

const Index: NextPage = () => {
  const [chainId, setChainId] = useState<constants.StarknetChainId>(
    constants.StarknetChainId.SN_SEPOLIA,
  );
  const [controller, setController] = useController();
  const [context, setContext] = useState<Context>();
  const [showSignup, setShowSignup] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState<string>();

  // Create connection if not stored
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.self === window.top) {
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
                } as Connect);
              });
            },
        ),
        disconnect: normalize(
          validate(
            (controller: Controller, origin: string) => async () =>
              controller.revoke(origin, chainId),
          ),
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
              ): Promise<ExecuteReply | Error> => {
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
                    } as Execute);
                  });
                }

                const account = controller.account(cId);
                const calls = Array.isArray(transactions)
                  ? transactions
                  : [transactions];
                const policies = calls.map(
                  (txn) =>
                    ({
                      target: txn.contractAddress,
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
                  transactionsDetail.maxFee = (
                    await account.estimateInvokeFee(calls, {
                      nonce: transactionsDetail.nonce,
                    })
                  ).suggestedMaxFee;
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

                const res = await account.execute(
                  calls,
                  abis,
                  transactionsDetail,
                );
                return {
                  code: ResponseCodes.SUCCESS,
                  ...res,
                };
              },
          ),
        ),
        estimateDeclareFee: normalize(validate(estimateDeclareFee)),
        estimateInvokeFee: normalize(validate(estimateInvokeFee)),
        provision: normalize(provision),
        register: normalize(register),
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
                  } as SignMessage);
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
      },
    });

    return () => {
      connection.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContext]);

  if (window.self === window.top) {
    return <></>;
  }

  if (!context?.origin) {
    return <></>;
  }

  // No controller, send to login
  if (!controller) {
    return (
      <>
        {showSignup ? (
          <Signup
            prefilledName={prefilledUsername}
            onLogin={(username) => {
              setPrefilledUsername(username);
              setShowSignup(false);
            }}
            onController={setController}
            context={context as Connect}
          />
        ) : (
          <Login
            prefilledName={prefilledUsername}
            onSignup={(username) => {
              setPrefilledUsername(username);
              setShowSignup(true);
            }}
            onController={setController}
            context={context as Connect}
          />
        )}
      </>
    );
  }

  const onLogout = (context: Context) => {
    setContext({
      origin: context.origin,
      type: "logout",
      resolve: context.resolve,
      reject: context.reject,
    } as Logout);
  };

  if (context.type === "connect") {
    const ctx = context as Connect;
    const session = controller.session(context.origin, chainId);

    // if no mismatch with existing policies then return success
    if (session && diff(session.policies, ctx.policies).length === 0) {
      ctx.resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address,
        policies: ctx.policies,
      });
      return <></>;
    }

    return (
      <Connect
        chainId={chainId}
        origin={ctx.origin}
        policies={ctx.type === "connect" ? (ctx as Connect).policies : []}
        onConnect={(policies) => {
          context.resolve({
            code: ResponseCodes.SUCCESS,
            address: controller.address,
            policies,
          } as any);
        }}
        onCancel={() =>
          ctx.resolve({ code: ResponseCodes.CANCELED, message: "Canceled" })
        }
        onLogout={() => onLogout(ctx)}
      />
    );
  }

  if (context.type === "logout") {
    const ctx = context as Logout;

    return (
      <Logout
        onConfirm={() => {
          logout(ctx.origin)();
          ctx.resolve({
            code: ResponseCodes.NOT_CONNECTED,
            message: "User logged out",
          });
        }}
        onCancel={() =>
          ctx.resolve({
            code: ResponseCodes.CANCELED,
            message: "User cancelled logout",
          })
        }
      />
    );
  }

  if (context.type === "sign-message") {
    const ctx = context as SignMessage;
    return (
      <SignMessage
        chainId={chainId}
        controller={controller}
        origin={ctx.origin}
        typedData={ctx.typedData}
        onSign={(sig: Signature) => context.resolve(sig)}
        onCancel={() =>
          ctx.resolve({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          })
        }
        onLogout={() => onLogout(ctx)}
      />
    );
  }

  if (context.type === "execute") {
    const ctx = context as Execute;

    return (
      <Execute
        {...ctx}
        chainId={ctx.transactionsDetail?.chainId ?? chainId}
        controller={controller}
        onExecute={(res: ExecuteReply) => ctx.resolve(res)}
        onCancel={() =>
          ctx.resolve({
            code: ResponseCodes.CANCELED,
            message: "Canceled",
          })
        }
        onLogout={() => onLogout(ctx)}
      />
    );
  }

  return <>*Waves*</>;
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
