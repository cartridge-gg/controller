import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, FormikState } from "formik";
import { css } from "@emotion/react";
import {
  Button,
  Input,
  InputProps,
  Tooltip,
  Circle,
  VStack,
  HStack,
  Text,
  Link,
  Spacer,
  InputGroup,
  useDisclosure,
  InputRightElement,
} from "@chakra-ui/react";
import {
  BeginRegistrationDocument,
  DeployAccountDocument,
  FinalizeRegistrationDocument,
  useAccountQuery,
} from "generated/graphql";
import { useDebounce } from "hooks/debounce";
import { constants, ec, KeyPair } from "starknet";
import { PopupCenter } from "utils/url";

import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import ReturnIcon from "@cartridge/ui/src/components/icons/Return";
import JoystickIcon from "@cartridge/ui/components/icons/Joystick";
import LockIcon from "@cartridge/ui/components/icons/Lock";
import { Logo } from "@cartridge/ui/components/icons/brand/Logo";
import FingerprintIcon from "components/icons/Fingerprint2";
import Web3Auth from "components/Web3Auth";
import Continue from "components/signup/Continue";
import { client } from "utils/graphql";
import Controller from "utils/controller";
import Container from "components/Container";
import { Header } from "components/Header";
import { Status } from "utils/account";
import { Authenticate as AuthModal } from "./Authenticate";
import { DrawerWrapper } from "components/DrawerWrapper";

export const Signup = ({
  fullPage = false,
  prefilledName = "",
  web3AuthEnabled = true,
  showLogin,
  onController,
  onComplete,
  onCancel,
}: {
  fullPage?: boolean;
  prefilledName?: string;
  web3AuthEnabled?: boolean;
  showLogin: () => void;
  onController?: (controller: Controller) => void;
  onComplete?: () => void;
  onCancel?: () => void;
}) => {
  const [name, setName] = useState(prefilledName);
  const [keypair, setKeypair] = useState<KeyPair>();
  const [nameError, setNameError] = useState("");
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [canContinue, setCanContinue] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const isIframe =
    typeof window !== "undefined" ? window.top !== window.self : false;

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const {
    isOpen: isAuthOpen,
    onOpen: onAuthOpen,
    onClose: onAuthClose,
  } = useDisclosure();

  const { debouncedValue: debouncedName, debouncing } = useDebounce(name, 1500);
  const {
    error,
    isFetching,
    data: accountData,
  } = useAccountQuery(
    { id: debouncedName },
    {
      enabled: !!(debouncedName && debouncedName.length >= 3),
      retry: isRegistering,
      retryDelay: 1000,
    },
  );

  // handle username input events
  useEffect(() => {
    if (debouncing) {
      return;
    }

    if (error) {
      if ((error as Error).message === "ent: account not found") {
        setNameError("");
        setCanContinue(true);
        if (!dismissed) {
          onDrawerOpen();
        }
      } else {
        setNameError("An error occured.");
        setCanContinue(false);
      }
    } else if (accountData?.account) {
      setNameError("This account already exists.");
      setCanContinue(false);
    }
  }, [error, accountData, debouncing, dismissed, onDrawerOpen]);

  // handle finalizing account
  useEffect(() => {
    if (accountData && isRegistering) {
      const {
        account: {
          credential: { id: credentialId },
          contractAddress: address,
        },
      } = accountData;

      const controller = new Controller(keypair, address, credentialId);
      if (onController) {
        onController(controller);
      }

      controller.account(constants.StarknetChainId.TESTNET).status =
        Status.DEPLOYING;
      client
        .request(DeployAccountDocument, {
          id: debouncedName,
          chainId: "starknet:SN_GOERLI",
        })
        .then(() => {
          controller.account(constants.StarknetChainId.TESTNET).sync();
        });
    }
  }, [accountData, isRegistering, debouncedName, keypair, onController]);

  const onContinue = useCallback(async () => {
    const keypair = ec.genKeyPair();
    const deviceKey = ec.getStarkKey(keypair);

    setKeypair(keypair);
    setIsRegistering(true);
    onAuthOpen();

    if (isIframe) {
      PopupCenter(
        `/authenticate?name=${encodeURIComponent(
          debouncedName,
        )}&pubkey=${encodeURIComponent(deviceKey)}`,
        "Cartridge Signup",
        480,
        640,
      );
    }
  }, [debouncedName, isIframe, onAuthOpen]);

  const validate = (values: { name: string }) => {
    setCanContinue(false);
    setNameError(undefined);
    if (!values.name) {
      setNameError("Username required");
    } else if (values.name.length < 3) {
      setNameError("Username must be at least 3 characters");
    } else if (values.name.split(" ").length > 1) {
      setNameError("Username cannot contain spaces");
    } else {
      setName(values.name);
    }
    return null;
  };

  if (isRegistering && isIframe) {
    return <Continue />;
  }

  return (
    <Container gap="18px" position={fullPage ? "relative" : "fixed"}>
      <Header onClose={onCancel} />
      <HStack spacing="14px" pt="36px">
        <Circle size="48px" bgColor="gray.700">
          <JoystickIcon boxSize="30px" />
        </Circle>
        <Ellipses />
        <Circle size="48px" bgColor="gray.700">
          <Logo boxSize="22px" color="brand" />
        </Circle>
      </HStack>
      <Text fontWeight="bold" fontSize="17px">
        Create your Controller
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
        validate={validate}
        onSubmit={() => {
          if (canContinue) {
            onDrawerOpen();
          }
        }}
      >
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
            }: {
              field: InputProps;
              form: FormikState<{ name: string }>;
            }) => (
              <Tooltip
                variant="error"
                mt="10px"
                placement="top"
                isOpen={!!nameError && !isFetching && !isRegistering}
                hasArrow
                label={
                  <>
                    <InfoIcon fill="whiteAlpha.600" mr="5px" />
                    {nameError}
                  </>
                }
              >
                <InputGroup>
                  <Input
                    {...field}
                    h="42px"
                    isInvalid
                    borderColor={
                      canContinue
                        ? "green.400"
                        : nameError
                        ? "red.400"
                        : "gray.600"
                    }
                    errorBorderColor="crimson"
                    placeholder="Username"
                    autoComplete="off"
                    onBlur={() => {
                      if (canContinue) {
                        onDrawerOpen();
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
                          onDrawerOpen();
                        }
                      }}
                    >
                      <ReturnIcon boxSize="20px" fill="green.400" />
                    </InputRightElement>
                  )}
                </InputGroup>
              </Tooltip>
            )}
          </Field>

          <HStack justify="center">
            <Text fontSize="12px" color="whiteAlpha.600" fontWeight="bold">
              Already have a controller?
            </Text>
            <Link variant="outline" fontSize="11px" onClick={showLogin}>
              Log In
            </Link>
          </HStack>
          <Spacer minHeight="50px" />
          <DrawerWrapper
            isWrapped={!fullPage}
            isOpen={isDrawerOpen}
            onClose={() => {
              setDismissed(true);
              onDrawerClose();
            }}
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
              <VStack w="full" gap="12px">
                <Button
                  w="full"
                  gap="10px"
                  onClick={() => onContinue()}
                  isDisabled={!!nameError || debouncing || name?.length === 0}
                >
                  <FingerprintIcon boxSize="20px" />
                  Continue
                </Button>
                {web3AuthEnabled && (
                  <Web3Auth
                    username={debouncedName}
                    onAuth={async (controller) => {
                      await client.request(BeginRegistrationDocument, {
                        id: debouncedName,
                      });
                      await client.request(FinalizeRegistrationDocument, {
                        credentials: "discord",
                        signer: controller.publicKey,
                      });
                      if (onController) {
                        onController(controller);
                      }

                      controller.account(
                        constants.StarknetChainId.TESTNET,
                      ).status = Status.DEPLOYING;
                      client
                        .request(DeployAccountDocument, {
                          id: debouncedName,
                          chainId: "starknet:SN_GOERLI",
                        })
                        .then(() => {
                          controller
                            .account(constants.StarknetChainId.TESTNET)
                            .sync();
                        });

                      if (onComplete) {
                        onComplete();
                      }
                    }}
                    isDisabled={!!nameError || debouncing || name?.length === 0}
                  />
                )}
              </VStack>
            </VStack>
          </DrawerWrapper>
        </Form>
      </Formik>
      <AuthModal
        isModal
        isOpen={isAuthOpen}
        onClose={onAuthClose}
        name={debouncedName}
        pubkey={keypair ? ec.getStarkKey(keypair) : ""}
        onComplete={onComplete}
      />
    </Container>
  );
};

const Ellipses = () => {
  return (
    <HStack spacing="3px">
      <Circle size="4px" bgColor="gray.400" />
      <Circle size="4px" bgColor="gray.400" />
      <Circle size="4px" bgColor="gray.400" />
    </HStack>
  );
};
