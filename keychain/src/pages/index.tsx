import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { ReactNode, useEffect, useState } from "react";

import { connectToParent } from "@cartridge/penpal";

import execute from "../methods/execute";
import { estimateDeclareFee, estimateInvokeFee } from "../methods/estimate";
import provision from "../methods/provision";
import { register, saveDeploy } from "../methods/register";
import login from "../methods/login";
import logout from "../methods/logout";
import { signMessage } from "../methods/sign";
import { revoke, session, sessions } from "../methods/sessions";

import Controller from "utils/controller";
import { normalize as normalizeOrigin } from "utils/url";
import { Policy, Session } from "@cartridge/controller";
import Connect from "components/Connect";
import { Login } from "components/Login";
import { Box, Container as ChakraContainer } from "@chakra-ui/react";
import { Header } from "components/Header";
import { Signature, typedData } from "starknet";
import SignMessage from "components/SignMessage";

export function normalize<T = Function>(
  fn: (origin: string) => T,
): (origin: string) => T {
  return (origin: string) => fn(normalizeOrigin(origin));
}

export function validate<T = Function>(
  fn: (controller: Controller, session: Session, origin: string) => T,
): (origin: string) => T {
  return (origin: string) => {
    const controller = Controller.fromStore();
    if (!controller) {
      throw new Error("no controller");
    }

    const session = controller.session(origin);
    if (!session) {
      throw new Error("not connected");
    }

    return fn(controller, session, origin);
  };
}

const Container = ({ children }: { children: ReactNode }) => (
  <ChakraContainer
    display="flex"
    alignItems="center"
    justifyContent="center"
    position="fixed"
    left={0}
    right={0}
    top={0}
    bottom={0}
  >
    <Header />
    <Box position="fixed" left={0} right={0} bottom={0} top="50px" overflowX="scroll">
      {children}
    </Box>
  </ChakraContainer>
);

type Context = Connect | SignMessage;

type Connect = {
  origin: string;
  type: "connect";
  policies: Policy[];
  resolve: ({
    address,
    policies,
  }: {
    address: string;
    policies: Policy[];
  }) => void;
  reject: (reason?: unknown) => void;
};

type SignMessage = {
  origin: string;
  type: "sign-message";
  typedData: typedData.TypedData;
  account: string;
  resolve: (signature: Signature) => void;
  reject: (reason?: unknown) => void;
};

const Index: NextPage = () => {
  const [context, setContext] = useState<Context>();
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.self === window.top) {
      return;
    }

    const connection = connectToParent({
      methods: {
        connect: normalize((origin: string) => async (policies: Policy[]) => {
          return await new Promise((resolve, reject) => {
            setContext({
              type: "connect",
              origin,
              policies,
              resolve,
              reject,
            } as Connect);
          });
        }),
        disconnect: normalize(
          validate(
            (controller: Controller, _session: Session, origin: string) => () =>
              controller.revoke(origin),
          ),
        ),
        execute: normalize(validate(execute)),
        estimateDeclareFee: normalize(validate(estimateDeclareFee)),
        estimateInvokeFee: normalize(validate(estimateInvokeFee)),
        provision: normalize(provision),
        register: normalize(register),
        login: normalize(login),
        logout: normalize(logout),
        probe: normalize(
          validate((controller: Controller, session: Session) => () => ({
            address: controller.address,
            policies: session.policies,
          })),
        ),
        revoke: normalize(revoke),
        signMessage: normalize(
          validate(
            (controller: Controller, session: Session) =>
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
        saveDeploy: normalize(saveDeploy),
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

  // No controller, send to login
  const controller = Controller.fromStore();
  if (!controller) {
    return (
      <Container>
        <Login />
      </Container>
    );
  }

  if (!context?.origin) {
    return <></>;
  }

  if (context.type === "connect") {
    const ctx = context as Connect;
    return (
      <Container>
        <Connect
          controller={controller}
          origin={ctx.origin}
          policys={
            ctx.type === "connect" ? (ctx as Connect).policies : []
          }
          onConnect={({
            address,
            policies,
          }: {
            address: string;
            policies: Policy[];
          }) => {
            ctx.resolve({ address, policies });
          }}
          onCancel={() => ctx.reject()}
        />
      </Container>
    );
  }

  // No session, gate access to methods below
  const sesh = controller.session(context.origin);
  if (!sesh) {
    return <div>nah</div>;
  }

  switch (context.type) {
    case "sign-message":
      const ctx: SignMessage = context as SignMessage;
      return (
        <Container>
          <SignMessage
            controller={controller}
            origin={ctx.origin}
            typedData={ctx.typedData}
            onSign={(sig) => context.resolve(sig)}
            onCancel={() => context.reject()}
          />
        </Container>
      );
    default:
      break;
  }

  // const { deployed, registered } = controller.account(chainId);
  // if (deployed && !registered) {
  //   return (
  //     <Container>
  //       {/* <Header address={controller.address} /> */}
  //       <Register
  //         chainId={chainId}
  //         onSubmit={onRegister}
  //         isLoading={isLoading}
  //         onCancel={cancel}
  //       />
  //     </Container>
  //   );
  // }

  // if (!controller) {
  //   return <Header address={controller.address} />;
  // }

  return <Container>Here</Container>;
};

export default dynamic(() => Promise.resolve(Index), { ssr: false });
