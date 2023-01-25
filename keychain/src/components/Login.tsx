import Fingerprint from "./icons/Fingerprint";
import { Formik, Form, Field, FormikState } from "formik";
import { useCallback, useEffect, useState } from "react";
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
  Link,
  Circle,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useAccountQuery } from "generated/graphql";
import base64url from "base64url";
import { useAnalytics } from "hooks/analytics";
import { beginLogin } from "hooks/account";
import login from "methods/login";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import { useDebounce } from "hooks/debounce";
import Web3Auth from "./Web3Auth";
import { constants } from "starknet";
import LockIcon from "@cartridge/ui/components/icons/Lock";
import ReturnIcon from "@cartridge/ui/src/components/icons/Return";
import Controller from "utils/controller";
import Container from "./Container";
import { Header } from "./Header";

export const Login = ({
  chainId,
  showSignup,
  onLogin,
  onCancel,
}: {
  chainId: constants.StarknetChainId;
  showSignup: () => void;
  onLogin: (controller: Controller) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [canContinue, setCanContinue] = useState(false);
  const { debouncedValue: debouncedName } = useDebounce(name, 1500);
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
      setCanContinue(true);
      onOpen();
    }

    if (error) {
      setNameError("This account does not exist");
    }
  }, [error, data, onOpen]);

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

      const { controller } = await login()(address, chainId, credentialId, {
        rpId: process.env.NEXT_PUBLIC_RP_ID,
        challengeExt: base64url.toBuffer(
          beginLoginData.beginLogin.publicKey.challenge,
        ),
      });

      onLogin(controller);
    } catch (err) {
      setIsLoggingIn(false);
      log({
        type: "webauthn_login_error",
        payload: {
          error: err?.message,
        },
      });
    }
  }, [chainId, name, data, onLogin, log]);

  return (
    <Container gap="18px">
      <Header onClose={onCancel} />
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
              width: 100%;
              margin-top: 0px !important;
              gap: 24px;
            `}
            spellCheck={false}
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
                    isOpen={!!nameError}
                    hasArrow
                    label={
                      <>
                        <InfoIcon fill="whiteAlpha.600" mr="5px" /> {nameError}
                      </>
                    }
                  >
                    <InputGroup>
                      <Input
                        {...field}
                        borderColor={
                          canContinue
                            ? "green.400"
                            : nameError
                            ? "red.400"
                            : "gray.600"
                        }
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError("");
                          setCanContinue(false);
                          props.handleChange(e);
                        }}
                        placeholder="Username"
                        autoComplete="off"
                        h="42px"
                      />
                      {canContinue && (
                        <InputRightElement
                          h="full"
                          mr="5px"
                          cursor="pointer"
                          onClick={() => {
                            if (canContinue) {
                              onOpen();
                            }
                          }}
                        >
                          <ReturnIcon boxSize="20px" fill="green.400" />
                        </InputRightElement>
                      )}
                    </InputGroup>
                  </Tooltip>
                </Flex>
              )}
            </Field>
            <HStack justify="center">
              <Text fontSize="12px" color="whiteAlpha.600" fontWeight="bold">
                Need a controller?
              </Text>
              <Link variant="outline" fontSize="11px" onClick={showSignup}>
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
                        By continuing you are agreeing to Cartridge&apos;s{" "}
                        <Link
                          textDecoration="underline"
                          href="https://cartridgegg.notion.site/Cartridge-Terms-of-Use-a7e65445041449c1a75aed697b2f6e62"
                          isExternal
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          textDecoration="underline"
                          href="https://cartridgegg.notion.site/Cartridge-Privacy-Policy-747901652aa34c6fb354c7d91930d66c"
                          isExternal
                        >
                          Privacy Policy
                        </Link>
                      </Text>
                    </HStack>
                    {data?.account.type === "webauthn" && (
                      <Button
                        w="full"
                        isLoading={isLoggingIn}
                        onClick={onSubmit}
                      >
                        Connect
                      </Button>
                    )}
                    {data?.account.type === "discord" && (
                      <Web3Auth
                        username={debouncedName}
                        onAuth={(controller) => {
                          onLogin(controller);
                        }}
                      />
                    )}
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </Form>
        )}
      </Formik>
    </Container>
  );
};
