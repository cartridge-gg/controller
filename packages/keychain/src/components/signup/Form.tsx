import { ReactNode, useEffect, useState } from "react";
import { css } from "@emotion/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Text,
  Button,
  Flex,
  HStack,
  VStack,
  Input,
  Tooltip,
  Link,
  Circle,
  useDisclosure,
  useBreakpointValue,
  StyleProps,
} from "@chakra-ui/react";
import { useAccountQuery } from "generated/graphql";
import { useDebounce } from "hooks/debounce";
import { useFormik } from "formik";

import ArrowIcon from "@cartridge/ui/src/components/icons/Arrow";
import PixelTargetIcon from "@cartridge/ui/src/components/icons/PixelTarget";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import { Credentials, onCreateBegin } from "hooks/account";
import { useAnalytics } from "hooks/analytics";
import Unsupported from "./Unsupported";
import { SimpleModal } from "@cartridge/ui/src/components/modals/SimpleModal";
import KeyNewIcon from "@cartridge/ui/src/components/icons/KeyNew";
import {
  AuthFingerprintImage,
  AuthFaceIdImage,
  AuthQrCodeImage,
} from "@cartridge/ui/src/components/icons/auth";

export type FormType = {
  onConfirm: (name: string, credentials: Credentials) => void;
};

export const Form = ({ onConfirm }: FormType) => {
  const router = useRouter();
  const { redirect_uri } = router.query;
  const [name, setName] = useState<string>();
  const [error, setError] = useState<Error>();
  const [AuthImage, setAuthImage] = useState<ReactNode>(AuthFingerprintImage);
  const [unsupported, setUnsupported] = useState<boolean>(false);
  const [unsupportedMessage, setUnsupportedMessage] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { event: analyticsEvent } = useAnalytics();

  const { debouncedValue, debouncing } = useDebounce(name, 1000);
  const {
    // error: accountError,
    data: existingAccount,
    isFetched,
  } = useAccountQuery(
    { id: debouncedValue },
    {
      enabled: !!(debouncedValue && debouncedValue.length > 0),
      retry: false,
    },
  );

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      const iosVersion = /OS (\d+)_?(?:\d+_?){0,2}\s/.exec(userAgent);
      if (iosVersion && Number(iosVersion[1]) < 16) {
        setUnsupported(true);
        setUnsupportedMessage(
          `iOS ${iosVersion[1]} does not support passkeys. Upgrade to iOS 16 to continue`,
        );
      }
      setAuthImage(AuthFaceIdImage);
    } else if (/android/i.test(userAgent)) {
      setAuthImage(AuthQrCodeImage);
    } else {
      setAuthImage(AuthFingerprintImage);
    }
  }, []);

  useEffect(() => {
    if (existingAccount) {
      setError(new Error("Account already exists"));
    }
  }, [existingAccount]);

  const validate = (values: { name: string }) => {
    setName(values.name);
    setError(undefined);
    if (!values.name) {
      setError(new Error("Username required"));
    } else if (values.name.length < 3) {
      setError(new Error("Username must be at least 3 characters"));
    } else if (values.name.split(" ").length > 1) {
      setError(new Error("Username cannot contain spaces"));
    }
    return null;
  };

  const formik = useFormik({
    initialValues: { name: "" },
    validate,
    onSubmit: onOpen,
  });

  const onSubmit = () => {
    analyticsEvent({ type: "webauthn_create" });
    onCreateBegin(name)
      .then((credentials) => {
        onConfirm(name, credentials);
      })
      .catch((err) => {
        console.error(err);
        formik.setSubmitting(false);
        analyticsEvent({
          type: "webauthn_create_error",
          payload: {
            error: `Error: ${err?.message} User Agent: ${navigator.userAgent}`,
          },
        });
      })
      .finally(() => {
        onClose();
      });
  };

  const onCancel = () => {
    router.push("/");
    analyticsEvent({ type: "signup_cancel" });
  };

  if (unsupported) {
    return <Unsupported message={unsupportedMessage} />;
  }

  return (
    <>
      <form
        css={css`
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 25px;
          width: 100%;
        `}
        onSubmit={formik.handleSubmit}
      >
        <Flex gap="1px" borderRadius="8px" overflow="hidden">
          <Box p="12px" bg="legacy.gray.700">
            <Circle size="54px" bg="legacy.gray.600">
              <PixelTargetIcon
                color={formik.errors.name ? "legacy.red.400" : "brand"}
                transition="all 0.2s ease"
              />
            </Circle>
          </Box>
          <Flex px="24px" flex="1" align="center" bg="legacy.gray.700">
            <Tooltip
              variant="error"
              mt="10px"
              placement="bottom"
              isOpen={!!error}
              hasArrow
              label={
                <HStack>
                  <InfoIcon fill="legacy.whiteAlpha.600" />
                  <Text>{error?.message}</Text>
                </HStack>
              }
            >
              <Input
                id="name"
                placeholder="Username"
                onChange={formik.handleChange}
                value={formik.values.name}
                isDisabled={formik.isSubmitting}
                borderColor={formik.errors.name && "legacy.red.400"}
                autoComplete="off"
              />
            </Tooltip>
          </Flex>
        </Flex>
        <ButtonsContainer>
          {!redirect_uri && (
            <Button
              variant="legacySecondary700"
              w="full"
              flex="1"
              onClick={onCancel}
              disabled={!!formik.isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            gap="10px"
            flex="1"
            type="submit"
            isLoading={formik.isSubmitting}
            disabled={
              !formik.isValid ||
              !!formik.isSubmitting ||
              !!existingAccount ||
              !isFetched ||
              debouncing
            }
          >
            {redirect_uri ? (
              <>
                Next <ArrowIcon />
              </>
            ) : (
              "Create"
            )}
          </Button>
        </ButtonsContainer>
        <HStack as="strong" justify="center" fontSize="13px">
          <Text color="legacy.whiteAlpha.600">Already have a controller?</Text>
          <NextLink href={{ pathname: "/login", query: router.query }}>
            <Link variant="traditional">Log In</Link>
          </NextLink>
        </HStack>
      </form>
      <SimpleModal
        icon={<KeyNewIcon boxSize="40px" />}
        onClose={() => {
          formik.setSubmitting(false);
          onClose();
        }}
        onConfirm={() => {
          formik.setSubmitting(true);
          onClose;
          onSubmit();
        }}
        confirmText="Continue"
        isOpen={isOpen}
        showCloseButton={false}
      >
        <VStack spacing="20px" py="10px">
          <Text fontSize="17px" fontWeight="bold">
            Authenticate Yourself
          </Text>
          <Text fontSize="14px" color="legacy.whiteAlpha.600" align="center">
            You will now be asked to authenticate yourself.
            <br />
            Note: this experience varies from browser to browser.
          </Text>
          {AuthImage}
          <Link
            isExternal
            href="https://www.yubico.com/authentication-standards/webauthn"
            fontSize="12px"
            variant="traditional"
          >
            Read about WebAuthn
          </Link>
        </VStack>
      </SimpleModal>
    </>
  );
};

// Positions buttons at the bottom of the screen on mobile
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
