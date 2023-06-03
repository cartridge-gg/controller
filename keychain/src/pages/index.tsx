import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { connectToParent } from "@cartridge/penpal";
import Controller, { diff, VERSION } from "utils/controller";
import {
  ConnectReply,
  Error,
  ResponseCodes,
  ExecuteReply,
  Policy,
  Session,
  ProbeReply,
  SupportedChainIds,
} from "@cartridge/controller";
import Connect from "components/Connect";
import { Login } from "components/Login";
import { Signup, StarterPack, Auth } from "components/signup";
import { Redeploy } from "components/Redeploy";
import {
  Abi,
  Call,
  constants,
  InvocationsDetails,
  number,
  Signature,
  typedData,
} from "starknet";
import SignMessage from "components/SignMessage";
import Execute from "components/Execute";
import selectors from "utils/selectors";
import Storage from "utils/storage";
import { estimateDeclareFee, estimateInvokeFee } from "../methods/estimate";
import provision from "../methods/provision";
import { register } from "../methods/register";
import login from "../methods/login";
import logout from "../methods/logout";
import { revoke, session, sessions } from "../methods/sessions";
import { Status } from "utils/account";
import { normalize, validate } from "../methods";
import DeploymentRequired from "components/DeploymentRequired";
import Quests from "./quests";
import Logout from "components/Logout";

type Context = Connect | Logout | Execute | SignMessage | StarterPack | Quests;

type Connect = {
  origin: string;
  type: "connect";
  policies: Policy[];
  starterPackId?: string;
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
  typedData: typedData.TypedData;
  account: string;
  resolve: (signature: Signature | Error) => void;
  reject: (reason?: unknown) => void;
};

type StarterPack = {
  origin: string;
  type: "starterpack";
  starterPackId: string;
  resolve: (res: ExecuteReply | Error) => void;
  reject: (reason?: unknown) => void;
};

type Quests = {
  origin: string;
  type: "quests";
  gameId: string;
  resolve: () => void;
  reject: () => void;
};

const Index: NextPage = () => {
  const [chainId, setChainId] = useState<constants.StarknetChainId>(
    constants.StarknetChainId.TESTNET,
  );
  const [controller, setController] = useState<Controller>();
  const [context, setContext] = useState<Context>();
  const [showSignup, setShowSignup] = useState<boolean>(false);

  useEffect(() => {
    setController(Controller.fromStore());
  }, [setController]);

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
              starterPackId?: string,
              chainId?: SupportedChainIds,
            ): Promise<ConnectReply> => {
              return await new Promise((resolve, reject) => {
                if (chainId) {
                  setChainId(chainId as unknown as constants.StarknetChainId);
                }

                setContext({
                  type: "connect",
                  origin,
                  policies,
                  starterPackId,
                  resolve,
                  reject,
                } as Connect);
              });
            },
        ),
        disconnect: normalize(
          validate(
            (controller: Controller, _session: Session, origin: string) =>
              async () => {
                controller.revoke(origin);
                return;
              },
          ),
        ),
        execute: normalize(
          validate(
            (controller: Controller, session: Session, origin: string) =>
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
                if (
                  !(
                    account.status === Status.REGISTERED ||
                    account.status === Status.REGISTERING
                  )
                ) {
                  return Promise.resolve({
                    code: ResponseCodes.NOT_ALLOWED,
                    message: "Account not registered or deployed.",
                  });
                }

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
                  number
                    .toBN(transactionsDetail.maxFee)
                    .gt(number.toBN(session.maxFee))
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
        login: normalize(login),
        logout: normalize(logout),
        probe: normalize(
          validate(
            (controller: Controller, session: Session) => (): ProbeReply => ({
              code: ResponseCodes.SUCCESS,
              address: controller.address,
              policies: session.policies,
            }),
          ),
        ),
        revoke: normalize(revoke),
        signMessage: normalize(
          validate(
            (_: Controller, _session: Session, origin: string) =>
              async (typedData: typedData.TypedData, account: string) => {
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
        session: normalize(session),
        sessions: normalize(sessions),
        reset: normalize(() => () => setContext(undefined)),
        issueStarterPack: normalize(
          (origin: string) => async (starterPackId: string) => {
            return await new Promise((resolve, reject) => {
              setContext({
                type: "starterpack",
                origin,
                starterPackId,
                resolve,
                reject,
              } as StarterPack);
            });
          },
        ),
        showQuests: normalize((origin: string) => async (gameId: string) => {
          return await new Promise((resolve, reject) => {
            setContext({
              type: "quests",
              origin,
              gameId,
              resolve,
              reject,
            } as Quests);
          });
        }),
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

  const onConnect = async ({
    context,
    policies,
    maxFee,
  }: {
    context: Context;
    policies: Policy[];
    maxFee: string;
  }) => {
    if (account.status === Status.COUNTERFACTUAL) {
      // TODO: Deploy?
      context.resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address,
        policies,
      } as any);
      return;
    }

    // This device needs to be registered, so do a webauthn signature request
    // for the register transaction during the connect flow.
    if (account.status === Status.DEPLOYED) {
      try {
        await account.register();
      } catch (e) {
        context.resolve({
          code: ResponseCodes.CANCELED,
          message: "Canceled",
        } as Error);
        return;
      }
    }

    controller.approve(context.origin, policies, maxFee);

    context.resolve({
      code: ResponseCodes.SUCCESS,
      address: controller.address,
      policies,
    } as any);
  };

  // No controller, send to login
  if (!controller) {
    return (
      <Auth
        onController={(c) => setController(c)}
        onCancel={() => context.reject()} />
    );

    return (
      <>
        {showSignup ? (
          <Signup
            showLogin={() => setShowSignup(false)}
            onController={(c) => setController(c)}
            onCancel={() => context.reject()}
          />
        ) : (
          <Login
            chainId={chainId}
            showSignup={() => setShowSignup(true)}
            onController={(c) => setController(c)}
            onCancel={() => context.reject()}
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

  const account = controller.account(
    (context as any).transactionsDetail?.chainId ?? chainId,
  );
  const sesh = controller.session(context.origin);

  if (context.type === "connect" || !sesh) {
    const ctx = context as Connect;

    // if no mismatch with existing policies then return success
    if (sesh && diff(sesh.policies, ctx.policies).length === 0) {
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
        policys={ctx.type === "connect" ? (ctx as Connect).policies : []}
        onConnect={() =>
          onConnect({
            context: ctx,
            policies: ctx.type === "connect" ? (ctx as Connect).policies : [],
            maxFee: "",
          })
        }
        onCancel={(error: Error) => ctx.resolve(error)}
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

  if (context.type === "starterpack") {
    const ctx = context as StarterPack;
    return (
      <StarterPack
        controller={controller}
        starterPackId={ctx.starterPackId}
        onClaim={(res: ExecuteReply) => ctx.resolve(res)}
        onCancel={(error: Error) => ctx.resolve(error)}
      />
    );
  }

  if (context.type === "quests") {
    const ctx = context as Quests;
    return (
      <Quests
        gameId={ctx.gameId}
        address={controller.address}
        chainId={chainId}
        onClose={() => ctx.resolve()}
        origin={ctx.origin}
        onLogout={() => onLogout(ctx)}
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
        onCancel={(error: Error) => ctx.resolve(error)}
        onLogout={() => onLogout(ctx)}
      />
    );
  }

  if (context.type === "execute") {
    const ctx = context as Execute;
    const _chainId = ctx.transactionsDetail?.chainId ?? chainId;
    const account = controller.account(_chainId);

    if (account.status === Status.DEPLOYED) {
      return (
        <Connect
          origin={ctx.origin}
          chainId={_chainId}
          policys={[]}
          onConnect={() =>
            onConnect({
              context: ctx,
              policies: [],
              maxFee: "",
            })
          }
          onCancel={(error: Error) => ctx.resolve(error)}
          onLogout={() => onLogout(ctx)}
        />
      );
    }

    if (account.status === Status.COUNTERFACTUAL) {
      return (
        <Redeploy
          chainId={_chainId}
          controller={controller}
          onClose={(error: Error) => ctx.resolve(error)}
          onLogout={() => onLogout(ctx)}
        />
      );
    }

    return (
      <DeploymentRequired
        chainId={chainId}
        controller={controller}
        onClose={(error: Error) => ctx.resolve(error)}
        onLogout={() => onLogout(ctx)}
      >
        <Execute
          {...ctx}
          chainId={_chainId}
          controller={controller}
          onExecute={(res: ExecuteReply) => ctx.resolve(res)}
          onCancel={(error: Error) => ctx.resolve(error)}
          onLogout={() => onLogout(ctx)}
        />
      </DeploymentRequired>
    );
  }

  return <>*Waves*</>;
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
