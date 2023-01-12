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
import { Web3AuthCore } from "@web3auth/core";
import {
    CHAIN_NAMESPACES,
    SafeEventEmitterProvider,
    WALLET_ADAPTERS,
} from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import Discord from "./icons/Discord";
import MetaMask from "./icons/Metamask";
import Twitter from "./icons/Twitter";
import NextLink from "next/link";

const clientId = "BKpRo2vJuxbHH3giMVQfdts2l1P3D51AB5hIZ_-HNfkfisVV94Q4aQcZbjXjduwZW8j6n1TlBaEl6Q1nOQXRCG0";

const SocialLogins = () => {
    const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);
    const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
        null
    );

    useEffect(() => {
        const init = async () => {
            try {
                const web3auth = new Web3AuthCore({
                    clientId,
                    chainConfig: {
                        chainNamespace: CHAIN_NAMESPACES.OTHER,
                    },
                    web3AuthNetwork: "cyan"
                });

                const openloginAdapter = new OpenloginAdapter();
                web3auth.configureAdapter(openloginAdapter);
                setWeb3auth(web3auth);

                await web3auth.init();
                if (web3auth.provider) {
                    setProvider(web3auth.provider);
                }
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);

    const login = async (loginProvider: "discord" | "twitter" | "metamask") => {
        if (!web3auth) {
            console.error("web3auth not initialized yet");
            return;
        }
        const web3authProvider = await web3auth.connectTo(
            WALLET_ADAPTERS.OPENLOGIN,
            { loginProvider }
        );
        setProvider(web3authProvider);
    };

    return (
        <HStack gap="12px">
            <Button flex={1} variant="secondary700" onClick={async () => {
                login("discord");
            }}><Discord height="18px" width="18px" /></Button>
            <Button flex={1} variant="secondary700" onClick={async () => {
                login("twitter");
            }}><Twitter height="18px" width="18px" /></Button>
            <Button flex={1} variant="secondary700" onClick={async () => {
                login("metamask");
            }}><MetaMask height="18px" width="18px" /></Button>
        </HStack>
    )
}

export const Login = () => {
    const [name, setName] = useState<string>();
    const { error, refetch } = useAccountQuery({ id: name }, { enabled: false });
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [unsupported, setUnsupported] = useState<boolean>(false);

    const { event: log } = useAnalytics();
    const router = useRouter();

    const { redirect_uri } = router.query as { redirect_uri: string };

    // useEffect(() => {
    //     if (debouncedName.length === 0) {
    //         return;
    //     }
    //     refetch();
    // }, [refetch, debouncedName])

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
                    error: `Error: ${err?.message} User Agent: ${navigator.userAgent}`,
                },
            });
        }
    }, [name, router, redirect_uri, refetch, log]);

    return (
        <Container maxWidth="432px" maxHeight="432px" bg="gray.900" borderRadius="8px" overflow="hidden">
            <VStack flex="1" p="36px" gap="24px">
                <Flex flexDirection="column" alignItems="center">
                    <Fingerprint width="48px" height="48px" />
                    <Text mt="16px" css={css`
                        font-family: 'IBM Plex Sans';
                        font-style: normal;
                        font-weight: 600;
                        font-size: 17px;
                    `}>Connect your Controller</Text>
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
                                                placeholder="Username"
                                                autoComplete="off"
                                                h="42px"
                                            />
                                        </Tooltip>
                                    </Flex>
                                )}
                            </Field>
                            <Button flex="1" lineHeight="40px" type="submit" isLoading={false}>
                                Connect Controller
                            </Button>
                            <HStack>
                                <Divider borderColor="whiteAlpha.500" />
                                <Text mx="18px" fontFamily="IBM Plex Sans" fontSize="12px" color="whiteAlpha.600" fontWeight="600">or</Text>
                                <Divider borderColor="whiteAlpha.500" />
                            </HStack>
                            <SocialLogins />
                            <HStack as="strong" justify="center" fontSize="13px">
                                <Text color="whiteAlpha.600">
                                    {"Don't have a controller?"}
                                </Text>
                                <NextLink
                                    href={{ pathname: "https://cartridge.gg/signup", query: router.query }}
                                >
                                    <Link variant="traditional">Sign up</Link>
                                </NextLink>
                            </HStack>
                        </Form>
                    )}
                </Formik>
            </VStack>
        </Container>
    );
}