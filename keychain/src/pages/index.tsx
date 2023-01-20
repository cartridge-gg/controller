import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { ReactNode, useEffect, useState } from "react";

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
} from "@cartridge/controller";
import Connect from "components/Connect";
import { Login } from "components/Login";
import { Signup } from "components/signup";
import { VStack, Container as ChakraContainer } from "@chakra-ui/react";
import { Header } from "components/Header";
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

const Container = ({ children }: { children: ReactNode }) => (
  <ChakraContainer p="36px" position="fixed">
    <Header />
    {children}
  </ChakraContainer>
);

type Context = Connect | Execute | SignMessage;

type Connect = {
  origin: string;
  type: "connect";
  policies: Policy[];
  resolve: (res: ConnectReply | Error) => void;
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
            async (policies: Policy[]): Promise<ConnectReply> => {
              return await new Promise((resolve, reject) => {
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
                if (!account.registered || !account.deployed) {
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
      <Container>
        {showSignup ? (
          <Signup
            showLogin={() => setShowSignup(false)}
            onSignup={(c) => setController(c)}
          />
        ) : (
          <Login
            chainId={chainId}
            showSignup={() => setShowSignup(true)}
            onLogin={(c) => setController(c)}
            onCancel={() => context.reject()}
          />
        )}
      </Container>
    );
  }

  const account = controller.account(chainId);

  const sesh = controller.session(context.origin);
  if (context.type === "connect" || !sesh) {
    const ctx = context as Connect;
    return (
      <Container>
        <Connect
          chainId={chainId}
          controller={controller}
          origin={ctx.origin}
          policys={ctx.type === "connect" ? (ctx as Connect).policies : []}
          onConnect={async ({
            address,
            policies,
          }: {
            address: string;
            policies: Policy[];
          }) => {
            if (account.status === Status.COUNTERFACTUAL) {
              // TODO: Deploy?
              ctx.resolve({ code: ResponseCodes.SUCCESS, address, policies });
              return;
            }

            // This device needs to be registered, so do a webauthn signature request
            // for the register transaction during the connect flow.
            const pendingRegister = Storage.get(
              selectors[VERSION].register(controller.address, chainId),
            );
            if (!account.registered && !pendingRegister) {
              const { assertion, invoke } = await controller.signAddDeviceKey(
                chainId,
              );
              Storage.set(
                selectors[VERSION].register(controller.address, chainId),
                { assertion, invoke },
              );
            }

            ctx.resolve({ code: ResponseCodes.SUCCESS, address, policies });
          }}
          onCancel={(error: Error) => ctx.resolve(error)}
        />
      </Container>
    );
  }

  if (context.type === "sign-message") {
    const ctx = context as SignMessage;
    return (
      <Container>
        <SignMessage
          chainId={chainId}
          controller={controller}
          origin={ctx.origin}
          typedData={ctx.typedData}
          onSign={(sig: Signature) => context.resolve(sig)}
          onCancel={(error: Error) => ctx.resolve(error)}
        />
      </Container>
    );
  }

  if (context.type === "execute") {
    const ctx = context as Execute;
    const _chainId = ctx.transactionsDetail?.chainId ?? chainId;
    const account = controller.account(_chainId);

    if (account.status === Status.COUNTERFACTUAL) {
      return <div>Deploy</div>;
    }

    return (
      <Container>
        <Execute
          {...ctx}
          chainId={_chainId}
          controller={controller}
          onExecute={(res: ExecuteReply) => ctx.resolve(res)}
          onCancel={(error: Error) => ctx.resolve(error)}
        />
      </Container>
    );
  }

  return <Container>*Waves*</Container>;
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
