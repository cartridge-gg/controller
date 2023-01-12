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
  Container,
  Link,
  Divider,
} from "@chakra-ui/react";
import { useAccountQuery } from "generated/graphql";
import base64url from "base64url";
import { useAnalytics } from "hooks/analytics";
import { useRouter } from "next/router";
import { beginLogin } from "hooks/account";
import login from "methods/login";
import InfoIcon from "@cartridge/ui/src/components/icons/Info";
import NextLink from "next/link";
import { useDebounce } from "hooks/debounce";
import Web3Auth from "./Web3Auth";
import { KeyPair } from "starknet";

export const Login = () => {
  const [name, setName] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [unsupported, setUnsupported] = useState<boolean>(false);
  const { debouncedValue: debouncedName } = useDebounce(name, 100);
  const { error, refetch } = useAccountQuery(
    { id: debouncedName },
    { enabled: false },
  );

  const { event: log } = useAnalytics();
  const router = useRouter();

  const { redirect_uri } = router.query as { redirect_uri: string };

  useEffect(() => {
    if (debouncedName.length === 0) {
      return;
    }
    refetch();
  }, [refetch, debouncedName]);

  const onLogin = useCallback(async () => {
    log({ type: "webauthn_login" });
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
      log({
        type: "webauthn_login_error",
        payload: {
          error: err?.message,
        },
      });
    }
  }, [name, router, redirect_uri, refetch, log]);

  return (
    <Container
      maxWidth="432px"
      maxHeight="432px"
      bg="gray.900"
      borderRadius="8px"
      overflow="hidden"
    >
      <VStack flex="1" p="36px" gap="24px">
        <Flex flexDirection="column" alignItems="center">
          <Fingerprint width="48px" height="48px" />
          <Text
            mt="16px"
            css={css`
              font-family: "IBM Plex Sans";
              font-style: normal;
              font-weight: 600;
              font-size: 17px;
            `}
          >
            Connect your Controller
          </Text>
        </Flex>
        <Formik initialValues={{ name: "" }} onSubmit={onLogin}>
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
                  <Flex flex="1" align="center" bg="gray.700">
                    <Tooltip
                      variant="error"
                      mt="10px"
                      placement="top"
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
                        placeholder="Username"
                        autoComplete="off"
                        h="42px"
                      />
                    </Tooltip>
                  </Flex>
                )}
              </Field>
              <Button
                flex="1"
                lineHeight="40px"
                type="submit"
                isLoading={false}
              >
                Connect Controller
              </Button>
              <HStack>
                <Divider borderColor="whiteAlpha.500" />
                <Text
                  mx="18px"
                  fontFamily="IBM Plex Sans"
                  fontSize="12px"
                  color="whiteAlpha.600"
                  fontWeight="600"
                >
                  or
                </Text>
                <Divider borderColor="whiteAlpha.500" />
              </HStack>
              <Web3Auth onAuth={(keyPair: KeyPair) => {}} />
              <HStack as="strong" justify="center" fontSize="13px">
                <Text color="whiteAlpha.600">{"Don't have a controller?"}</Text>
                <NextLink
                  href={{
                    pathname: "https://cartridge.gg/signup",
                    query: router.query,
                  }}
                >
                  <Link variant="traditional">Create Account</Link>
                </NextLink>
              </HStack>
            </Form>
          )}
        </Formik>
      </VStack>
    </Container>
  );
};
