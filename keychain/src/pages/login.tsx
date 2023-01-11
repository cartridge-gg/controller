import { useCallback, useEffect, useState, ReactNode } from "react";
import { Formik, Form, Field, FormikState } from "formik";
import type { NextPage } from "next";
import NextLink from "next/link";
import { css } from "@emotion/react";
import {
  Box,
  Button,
  Flex,
  Input,
  InputProps,
  Tooltip,
  Circle,
  Container,
  VStack,
  HStack,
  Text,
  Link,
  StyleProps,
  useBreakpointValue,
} from "@chakra-ui/react";
import base64url from "base64url";

import ControllerImage from "@cartridge/ui/src/components/icons/ControllerBig";
import PixelTargetIcon from "@cartridge/ui/src/components/icons/PixelTarget";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import { Header } from "components/Header";
import { Dialog } from "@cartridge/ui/src/components/Dialog";

import { motion } from "framer-motion";
import { beginLogin } from "hooks/account";
import login from "methods/login";

import { useAccountQuery } from "generated/graphql";
import { useRouter } from "next/router";
import { useAnalytics } from "hooks/analytics";
import Unsupported from "components/signup/Unsupported";
import { isWhitelisted } from "utils/whitelist";
import { useControllerModal } from "hooks/modal";

const Login: NextPage = () => {
  const [name, setName] = useState<string>();
  const [isEmbedded, setIsEmbedded] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [unsupported, setUnsupported] = useState<boolean>(false);
  const [showSignup, setShowSignup] = useState<boolean>(true);
  const [unsupportedMessage, setUnsupportedMessage] = useState<string>();

  const router = useRouter();
  const { redirect_uri } = router.query as { redirect_uri: string };
  const { event: analyticsEvent } = useAnalytics();
  const { error, refetch } = useAccountQuery({ id: name }, { enabled: false });
  const { cancel } = useControllerModal();

  const onLogin = useCallback(async () => {
    analyticsEvent({ type: "webauthn_login" });
    setIsLoggingIn(true);

    try {
      const result = await refetch();
      const {
        account: {
          credential: { id: credentialId },
          contractAddress: address,
        },
      } = result.data;

      const { data: beginLoginData } = await beginLogin(name);

      await login()(address, credentialId, {
        rpId: process.env.NEXT_PUBLIC_RP_ID,
        challengeExt: base64url.toBuffer(
          beginLoginData.beginLogin.publicKey.challenge,
        ),
      });

      if (redirect_uri) {
        router.replace(decodeURIComponent(redirect_uri));
        return;
      }

      router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/profile/${address}`);
    } catch (err) {
      console.error(err);
      setIsLoggingIn(false);
      analyticsEvent({
        type: "webauthn_login_error",
        payload: {
          error: `Error: ${err?.message} User Agent: ${navigator.userAgent}`,
        },
      });
    }
  }, [name, router, redirect_uri, refetch, analyticsEvent]);

  // show signup for white listed sites
  useEffect(() => {
    setShowSignup(isWhitelisted(redirect_uri));
  }, [redirect_uri]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;

    const iosVersion = /OS (\d+)_?(?:\d+_?){0,2}\s/.exec(userAgent);
    if (iosVersion && Number(iosVersion[1]) < 16) {
      setUnsupported(true);
      setUnsupportedMessage(
        `iOS ${iosVersion[1]} does not support passkeys. Upgrade to iOS 16 to continue`,
      );
    }

    if (window.top !== window.self) {
      setIsEmbedded(true);
    }
  }, []);

  const onCancel = () => {
    cancel();
    analyticsEvent({ type: "login_cancel" });
  };

  if (unsupported) {
    return (
      <Box h="100%">
        <Header />
        <VStack h="400px" justify="center">
          <Unsupported message={unsupportedMessage} />
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Flex top="-100px" w="full" position="fixed" justify="center" zIndex="-1">
        <ControllerImage opacity="0.45" fill="whiteAlpha.50" />
      </Flex>
      <Container
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        w={["full", "400px"]}
        h="calc(100vh - 74px)"
        pt="100px"
        centerContent
      >
        <Flex direction="column" align="center" w="full" h="full">
          <Dialog
            width={["full", "340px"]}
            title="Let's plug in!"
            description="Enter your username"
            mb={["30px", "50px"]}
          />
          <Formik initialValues={{ name: "", password: "" }} onSubmit={onLogin}>
            {(props) => (
              <Form
                css={css`
                  display: flex;
                  flex-direction: column;
                  flex: 1;
                  gap: 25px;
                  width: 100%;
                `}
              >
                <Field name="name">
                  {({
                    field,
                    form,
                  }: {
                    field: InputProps;
                    form: FormikState<{ name: string }>;
                  }) => (
                    <Flex gap="1px" overflow="hidden" borderRadius="8px">
                      <Box p="12px" bg="gray.700">
                        <Circle size="54px" bg="gray.600">
                          <PixelTargetIcon
                            color={error ? "red.400" : "brand"}
                            transition="all 0.2s ease"
                          />
                        </Circle>
                      </Box>
                      <Flex px="24px" flex="1" align="center" bg="gray.700">
                        <Tooltip
                          variant="error"
                          mt="10px"
                          placement="bottom"
                          isOpen={!!error}
                          hasArrow
                          label={
                            <>
                              <InfoIcon fill="whiteAlpha.600" mr="5px" /> This
                              account does not exist
                            </>
                          }
                        >
                          <Input
                            {...field}
                            borderColor={error && "red.400"}
                            onChange={(e) => {
                              setName(e.target.value);
                              props.handleChange(e);
                            }}
                            autoComplete="off"
                          />
                        </Tooltip>
                      </Flex>
                    </Flex>
                  )}
                </Field>
                <ButtonsContainer>
                  <Button
                    variant="secondary700"
                    w="full"
                    flex="1"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button flex="1" type="submit" isLoading={isLoggingIn}>
                    Log in
                  </Button>
                </ButtonsContainer>
                {showSignup && (
                  <HStack as="strong" justify="center" fontSize="13px">
                    <Text color="whiteAlpha.600">
                      {"Don't have a controller?"}
                    </Text>
                    <NextLink
                      href={{ pathname: "/signup", query: router.query }}
                      passHref={isEmbedded}
                    >
                      <Link variant="traditional" isExternal={isEmbedded}>
                        Sign up
                      </Link>
                    </NextLink>
                  </HStack>
                )}
              </Form>
            )}
          </Formik>
        </Flex>
      </Container>
    </>
  );
};

const ButtonsContainer = ({ children }: { children: ReactNode }) => {
  const isMobile = useBreakpointValue([true, false]);
  const styles =
    isMobile &&
    ({
      position: "fixed",
      bottom: "0",
      left: "0",
      p: "15px",
      w: ["full", "400px"],
    } as StyleProps);
  return (
    <Flex gap="14px" {...styles}>
      {children}
    </Flex>
  );
};

export default Login;
