import { useEffect, useState, useCallback, ReactNode } from "react";
import { Formik, Form, Field, FormikState } from "formik";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import {
  Flex,
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
  StyleProps,
  useInterval,
} from "@chakra-ui/react";
import {
  DiscordRevokeDocument,
  BeginRegistrationDocument,
  DeployAccountDocument,
  FinalizeRegistrationDocument,
  useAccountQuery,
  useStarterPackQuery,
} from "generated/graphql";
import { useDebounce } from "hooks/debounce";
import { constants, ec, KeyPair } from "starknet";
import { PopupCenter } from "utils/url";

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
import { useWhitelist } from "hooks/whitelist";
import BannerImage from "./BannerImage";
import Ellipses from "./Ellipses";
import { ClaimSuccess } from "./StarterPack";
import {
  InfoIcon,
  JoystickSolidIcon,
  LockIcon,
  MysteryIcon,
  OlmechIcon,
  SparklesSolidIcon,
} from "@cartridge/ui";

export const Signup = ({
  fullPage = false,
  prefilledName = "",
  starterPackId,
  showLogin,
  onController,
  onComplete,
  onCancel,
}: {
  fullPage?: boolean;
  prefilledName?: string;
  starterPackId?: string;
  showLogin: () => void;
  onController?: (controller: Controller) => void;
  onComplete?: () => void;
  onCancel?: () => void;
}) => {
  const [name, setName] = useState(prefilledName);
  const [keypair, setKeypair] = useState<KeyPair>();
  const [nameError, setNameError] = useState("");
  const [selectedName, setSelectedName] = useState<string>();
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [canContinue, setCanContinue] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);

  const isIframe =
    typeof window !== "undefined" ? window.top !== window.self : false;
  const { web3AuthEnabled } = useWhitelist();

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
      enabled: !!(debouncedName && debouncedName.length >= 3) && !isRegistering,
      retry: false,
    },
  );

  const {
    data: starterData,
    error: starterError,
    isLoading: starterLoading,
  } = useStarterPackQuery(
    {
      id: starterPackId,
    },
    { enabled: !!starterPackId && !isRegistering },
  );

  const remaining = starterData
    ? starterData.game.starterPack.maxIssuance -
      starterData.game.starterPack.issuance
    : 0;

  useAccountQuery(
    { id: selectedName },
    {
      enabled: isRegistering,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : undefined),
      onSuccess: (data) => deploy(data),
    },
  );

  const deploy = useCallback(
    (data) => {
      console.log("deploy request");
      const {
        account: {
          credential: { id: credentialId },
          contractAddress: address,
        },
      } = data;

      const controller = new Controller(keypair, address, credentialId);

      if (onController) onController(controller);

      controller.account(constants.StarknetChainId.TESTNET).status =
        Status.DEPLOYING;
      client
        .request(DeployAccountDocument, {
          id: debouncedName,
          chainId: "starknet:SN_GOERLI",
          starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
            "SN_GOERLI",
          )
            ? [starterData?.game?.starterPack?.id]
            : undefined,
        })
        .then(() => {
          controller.account(constants.StarknetChainId.TESTNET).sync();
        });

      controller.account(constants.StarknetChainId.MAINNET).status =
        Status.DEPLOYING;
      client
        .request(DeployAccountDocument, {
          id: debouncedName,
          chainId: "starknet:SN_MAIN",
          starterpackIds: starterData?.game?.starterPack?.chainID?.includes(
            "SN_MAIN",
          )
            ? [starterData?.game?.starterPack?.id]
            : undefined,
        })
        .then(() => {
          controller.account(constants.StarknetChainId.MAINNET).sync();
        });
    },
    [keypair, onController],
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

  const onContinue = useCallback(async () => {
    const keypair = ec.genKeyPair();
    const deviceKey = ec.getStarkKey(keypair);

    setIsRegistering(true);
    setKeypair(keypair);
    setSelectedName(debouncedName);

    // due to same origin restriction, if we're in iframe, pop up a
    // window to continue webauthn registration. otherwise,
    // display modal overlay. in either case, account is created in
    // authenticate component, so we poll and then deploy
    if (isIframe) {
      PopupCenter(
        `/authenticate?name=${encodeURIComponent(
          debouncedName,
        )}&pubkey=${encodeURIComponent(deviceKey)}`,
        "Cartridge Signup",
        480,
        640,
      );
    } else {
      onAuthOpen();
    }
  }, [debouncedName, starterData, isIframe, onAuthOpen, onController]);

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
    return <Continue position={fullPage ? "relative" : "fixed"} />;
  }

  if (claimSuccess) {
    // hardcode briq for now
    const media =
      starterData?.game.name === "Briq"
        ? "https://storage.googleapis.com/c7e-prod-static/media/briq_cartridge_poap_nft_paris_1_7x16x11.glb"
        : undefined;
    return (
      <ClaimSuccess
        name={starterData?.game.name}
        banner={starterData?.game.banner.uri}
        url={starterData?.game.socials.website}
        media={media}
        fullPage={fullPage}
      />
    );
  }

  return (
    <Container gap="18px" position={fullPage ? "relative" : "fixed"}>
      <Header onClose={onCancel} />
      {starterData && remaining > 0 && (
        <BannerImage
          imgSrc={starterData?.game.banner.uri}
          obscuredWidth="0px"
        />
      )}
      <HStack spacing="14px" pt="36px">
        <Circle size="48px" bgColor="gray.700">
          <JoystickSolidIcon boxSize="30px" />
        </Circle>
        <Ellipses />
        <Circle size="48px" bgColor="gray.700">
          {/* TODO: icon <Logo boxSize="22px" color="brand" /> */}
          <MysteryIcon boxSize="22px" color="brand" />
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
                    isDisabled={isRegistering}
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
                      {/* TODO: icon <ReturnIcon boxSize="20px" fill="green.400" /> */}
                      <MysteryIcon boxSize="20px" fill="green.400" />
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
            <VStack gap="14px" color="whiteAlpha.600" align="flex-start">
              {starterData && remaining > 0 && (
                <>
                  <HStack gap="10px">
                    {starterData.game.starterPack.starterPackTokens.map(
                      (data, key) => (
                        <ImageFrame
                          key={key}
                          bgImage={`url(${data.token.thumbnail.uri})`}
                        />
                      ),
                    )}
                    <ImageFrame>
                      <OlmechIcon boxSize="30px" />
                    </ImageFrame>
                  </HStack>
                  <HStack align="flex-start">
                    <SparklesSolidIcon />
                    <Text fontSize="12px" color="whiteAlpha.600">
                      Claim Starterpack
                    </Text>
                  </HStack>
                </>
              )}
              <HStack align="flex-start">
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
                  isDisabled={
                    isRegistering ||
                    !canContinue ||
                    !!nameError ||
                    debouncing ||
                    name?.length === 0
                  }
                >
                  <FingerprintIcon boxSize="20px" />
                  Continue
                </Button>
                {web3AuthEnabled && (
                  <Web3Auth
                    username={debouncedName}
                    onAuth={async (controller, token) => {
                      await client.request(BeginRegistrationDocument, {
                        id: debouncedName,
                      });
                      await client.request(FinalizeRegistrationDocument, {
                        credentials: "discord",
                        signer: controller.publicKey,
                      });
                      await client.request(DiscordRevokeDocument, {
                        token: token,
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
                          console.log("sync signup");
                          controller
                            .account(constants.StarknetChainId.TESTNET)
                            .sync();
                        });

                      if (onComplete) {
                        onComplete();
                      }
                    }}
                    isDisabled={
                      isRegistering ||
                      !canContinue ||
                      !!nameError ||
                      debouncing ||
                      name?.length === 0
                    }
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
        onComplete={() => {
          if (starterPackId) {
            setClaimSuccess(true);
            return;
          }

          onComplete();
        }}
      />
    </Container>
  );
};

const ImageFrame = ({
  bgImage,
  children,
  ...rest
}: {
  bgImage?: string;
  children?: ReactNode;
} & StyleProps) => (
  <Flex
    align="center"
    justify="center"
    boxSize="48px"
    border="1px solid"
    borderColor="green.400"
    borderRadius="6px"
    bgPosition="center"
    bgRepeat="no-repeat"
    bgSize="contain"
    bgColor="gray.600"
    bgImage={bgImage}
  >
    {children}
  </Flex>
);
