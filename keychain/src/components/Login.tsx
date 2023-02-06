import Fingerprint from "./icons/Fingerprint";
import { Formik, Form, Field, FormikState } from "formik";
import { ReactNode, useCallback, useEffect, useState } from "react";
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
  Spacer,
  useDisclosure,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useAccountQuery, DiscordRevokeDocument } from "generated/graphql";
import { client } from "utils/graphql";
import base64url from "base64url";
import { useAnalytics } from "hooks/analytics";
import { beginLogin, onLoginFinalize } from "hooks/account";
import login from "methods/login";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import { useDebounce } from "hooks/debounce";
import Web3Auth from "./Web3Auth";
import { constants, ec } from "starknet";
import LockIcon from "@cartridge/ui/components/icons/Lock";
import ReturnIcon from "@cartridge/ui/src/components/icons/Return";
import Controller from "utils/controller";
import Container from "./Container";
import { Header } from "./Header";
import { DrawerWrapper } from "components/DrawerWrapper";
import FingerprintIcon from "./icons/Fingerprint2";
import { useWhitelist } from "hooks/whitelist";
import { WebauthnSigner } from "utils/webauthn";

export const Login = ({
  chainId,
  fullPage = false,
  prefilledName = "",
  showSignup,
  onController,
  onComplete,
  onCancel,
}: {
  chainId: constants.StarknetChainId;
  fullPage?: boolean;
  prefilledName?: string;
  showSignup: () => void;
  onController?: (controller: Controller) => void;
  onComplete?: () => void;
  onCancel?: () => void;
}) => {
  const [name, setName] = useState(prefilledName);
  const [nameError, setNameError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [canContinue, setCanContinue] = useState(false);
  const { debouncedValue: debouncedName } = useDebounce(name, 1500);
  const { signupEnabled } = useWhitelist();
  const { event: log } = useAnalytics();
  const {
    error,
    refetch,
    data: accountData,
  } = useAccountQuery({ id: debouncedName }, { enabled: false, retry: false });

  useEffect(() => {
    if (debouncedName.length === 0) {
      return;
    }
    refetch();
  }, [refetch, debouncedName]);

  useEffect(() => {
    if (accountData) {
      setCanContinue(true);
      onOpen();
    }

    if (error) {
      setNameError("This account does not exist");
    }
  }, [error, accountData, onOpen]);

  const onSubmit = useCallback(async () => {
    log({ type: "webauthn_login" });
    setIsLoggingIn(true);

    try {
      const {
        account: {
          credential: { id: credentialId, publicKey },
          contractAddress: address,
        },
      } = accountData;

      const { data: beginLoginData } = await beginLogin(name);
      const signer: WebauthnSigner = new WebauthnSigner(
        credentialId,
        publicKey,
      );

      const assertion = await signer.sign(
        base64url.toBuffer(beginLoginData.beginLogin.publicKey.challenge),
      );

      const res = await onLoginFinalize(assertion);
      if (!res.finalizeLogin) {
        throw Error("login failed");
      }

      const keypair = ec.genKeyPair();
      const controller = new Controller(keypair, address, credentialId);

      if (onController) {
        onController(controller);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setIsLoggingIn(false);
      log({
        type: "webauthn_login_error",
        payload: {
          error: err?.message,
        },
      });
    }
  }, [chainId, name, accountData, onController, log, onComplete]);

  return (
    <Container gap="18px" position={fullPage ? "relative" : "fixed"}>
      <Header chainId={chainId} onClose={() => onCancel()} />
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
      <Formik
        initialValues={{ name }}
        onSubmit={() => {
          if (canContinue) {
            onOpen();
          }
        }}
      >
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
                        onBlur={() => {
                          if (canContinue) {
                            onOpen();
                          }
                        }}
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
            {signupEnabled && (
              <HStack justify="center">
                <Text fontSize="12px" color="whiteAlpha.600" fontWeight="bold">
                  Need a controller?
                </Text>
                <Link variant="outline" fontSize="11px" onClick={showSignup}>
                  Create Controller
                </Link>
              </HStack>
            )}
            <Spacer minHeight="50px" />
            <DrawerWrapper
              isWrapped={!fullPage}
              isOpen={isOpen}
              onClose={onClose}
            >
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
                {accountData ? (
                  <>
                    {accountData.account.type === "webauthn" && (
                      <Button
                        w="full"
                        gap="10px"
                        isLoading={isLoggingIn}
                        onClick={onSubmit}
                      >
                        <FingerprintIcon boxSize="20px" /> Connect
                      </Button>
                    )}
                    {accountData.account.type === "discord" && (
                      <Web3Auth
                        username={debouncedName}
                        onAuth={async (controller, token) => {
                          await client.request(DiscordRevokeDocument, {
                            token: token,
                          });

                          if (onController) {
                            onController(controller);
                          }

                          if (onComplete) {
                            onComplete();
                          }
                        }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {fullPage && (
                      <Button w="full" gap="10px" disabled>
                        <FingerprintIcon boxSize="20px" /> Connect
                      </Button>
                    )}
                  </>
                )}
              </VStack>
            </DrawerWrapper>
          </Form>
        )}
      </Formik>
    </Container>
  );
};
