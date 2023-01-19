import Fingerprint from "./icons/Fingerprint";
import { Formik, Form, Field, FormikState } from "formik";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { css } from "@emotion/react";
import {
  Button,
  Flex,
  Input,
  InputProps,
  Tooltip,
  VStack,
  HStack,
  Text,
  Container,
  Link,
  Circle,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
} from "@chakra-ui/react";
import { useAccountQuery } from "generated/graphql";
import base64url from "base64url";
import { useAnalytics } from "hooks/analytics";
import { beginLogin } from "hooks/account";
import login from "methods/login";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import { useDebounce } from "hooks/debounce";
import Web3Auth from "./Web3Auth";
import { constants, KeyPair } from "starknet";
import Footer from "components/Footer";
import { motion } from "framer-motion";
import LockIcon from "@cartridge/ui/components/icons/Lock";

export const Login = ({
  chainId,
  onSignup,
  onLogin,
  onCancel,
}: {
  chainId: constants.StarknetChainId;
  onSignup: () => void;
  onLogin: () => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState("");
  const [popupSignup, setPopupSignup] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [unsupported, setUnsupported] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { debouncedValue: debouncedName } = useDebounce(name, 500);
  const { error, refetch, data } = useAccountQuery(
    { id: debouncedName },
    { enabled: false, retry: false },
  );

  const { event: log } = useAnalytics();

  useEffect(() => {
    if (debouncedName.length === 0) {
      return;
    }
    refetch();
  }, [refetch, debouncedName]);

  useEffect(() => {
    if (data) {
      onOpen();
    }
  }, [data]);

  const onSubmit = useCallback(async () => {
    log({ type: "webauthn_login" });
    setIsLoggingIn(true);

    try {
      const {
        account: {
          credential: { id: credentialId },
          contractAddress: address,
        },
      } = data;

      const { data: beginLoginData } = await beginLogin(name);

      await login()(address, chainId, credentialId, {
        rpId: process.env.NEXT_PUBLIC_RP_ID,
        challengeExt: base64url.toBuffer(
          beginLoginData.beginLogin.publicKey.challenge,
        ),
      });

      onLogin();
    } catch (err) {
      console.error(err);
      setIsLoggingIn(false);
      log({
        type: "webauthn_login_error",
        payload: {
          error: err?.message,
        },
      });
    }
  }, [chainId, name, data, onLogin, refetch, log]);

  if (popupSignup) {
    return (
      <Container
        w={["full", "400px"]}
        h="calc(100vh - 74px)"
        pt="100px"
        centerContent
      >
        <Text>Please continue with signup in the new window.</Text>
        <Footer
          showConfirm={false}
          cancelText="Close"
          onCancel={() => {
            onCancel();
            // hack.. there's a delay before modal disappears, penpal latency?
            setTimeout(() => setPopupSignup(false), 500);
          }}
        />
      </Container>
    );
  }

  return (
    <VStack
      as={motion.div}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      p="36px"
      gap="18px"
    >
      <HStack spacing="14px" pt="36px">
        <Circle size="48px" bgColor="gray.700">
          <Fingerprint boxSize="30px" />
        </Circle>
      </HStack>
      <Text fontWeight="bold" fontSize="17px">
        Connect your Controller
      </Text>
      <Text
        fontSize="12px"
        mt="-8px !important"
        color="whiteAlpha.600"
        textAlign="center"
      >
        Your Controller will be used for interacting with the game.
      </Text>
      <Formik initialValues={{ name: "" }} onSubmit={() => {}}>
        {(props) => (
          <Form
            css={css`
              display: flex;
              flex-direction: column;
              flex: 1;
              width: 100%;
              margin-top: 0px !important;
              gap: 24px;
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
                <Flex flex="1" align="center">
                  <Tooltip
                    variant="error"
                    mt="10px"
                    placement="top"
                    isOpen={!!error}
                    hasArrow
                    label={
                      <>
                        <InfoIcon fill="whiteAlpha.600" mr="5px" /> This account
                        does not exist
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
                      placeholder="Username"
                      autoComplete="off"
                      h="42px"
                    />
                  </Tooltip>
                </Flex>
              )}
            </Field>
            {/* <Web3Auth onAuth={(keyPair: KeyPair) => {}} /> */}
            <HStack justify="center">
              <Text fontSize="12px" color="whiteAlpha.600" fontWeight="bold">
                Need a controller?
              </Text>
              <Link variant="outline" fontSize="11px" onClick={onSignup}>
                Create Controller
              </Link>
            </HStack>
            <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerBody p="36px">
                  <VStack gap="24px">
                    <HStack>
                      <LockIcon />
                      <Text fontSize="12px" color="whiteAlpha.600">
                        By continuing you are agreeing to Cartridge&apos;s Terms
                        of Service and Privacy Policy
                      </Text>
                    </HStack>
                    <Button w="full" isLoading={isLoggingIn} onClick={onSubmit}>
                      Connect
                    </Button>
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </Form>
        )}
      </Formik>
    </VStack>
  );
};
