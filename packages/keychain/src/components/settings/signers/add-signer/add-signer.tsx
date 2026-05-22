import { useCallback, useEffect, useMemo, useState } from "react";
import { useController } from "@/hooks/controller";
import { useWallets } from "@/hooks/wallets";
import {
  credentialToAddress,
  credentialToAuth,
} from "@/components/connect/types";
import { SignerPendingDrawer } from "@/components/connect/create/SignerPendingDrawer";
import { useSmsAuthentication } from "@/components/connect/create/sms";
import {
  SmsOtpDrawer,
  SmsOtpState,
} from "@/components/connect/create/sms/SmsOtpForm";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
import {
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
  AuthOption,
} from "@cartridge/controller";
import { JsAddSignerInput, Signer } from "@cartridge/controller-wasm";
import {
  AddUserIcon,
  Button,
  Drawer,
  DrawerContent,
  SignerMethod,
  SignerMethodKind,
} from "@cartridge/controller-ui";
import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/controller-ui/utils/api/cartridge";
import { QueryObserverResult } from "react-query";
import { ExternalWalletError } from "@/utils/errors";
import { SignerAlert } from "../signer-alert";
import { SocialProviderType } from "@/wallets/social/turnkey_utils";

type SignerPending = {
  kind: SignerMethodKind;
  inProgress: boolean;
  error?: string;
  authedAddress?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Unknown error";
}

const isExistingSigner = (
  currentSigners: CredentialMetadata[] | undefined,
  type: AuthOption,
) => {
  return (
    currentSigners?.some((signer) => credentialToAuth(signer) === type) ?? false
  );
};

interface AddSignerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  controllerQuery: QueryObserverResult<ControllerQuery>;
}

export function AddSignerDrawer({
  isOpen,
  onClose,
  controllerQuery,
}: AddSignerDrawerProps) {
  const { controller } = useController();
  const smsAuth = useSmsAuthentication();
  const [wallets, setWallets] = useState<boolean>(false);
  const [signerPending, setSignerPending] = useState<SignerPending | null>(
    null,
  );
  const [smsState, setSmsState] = useState<SmsOtpState | null>(null);

  const currentSigners = useMemo(
    () =>
      controllerQuery.data?.controller?.signers?.map(
        (signer) => signer.metadata as CredentialMetadata,
      ),
    [controllerQuery.data],
  );

  const handleClick = useCallback(
    async (
      auth: SignerMethodKind,
      authFn: (auth: SignerMethodKind) => Promise<string | undefined>,
    ) => {
      try {
        setSignerPending({
          kind: auth,
          inProgress: true,
        });

        const alreadyOwner = await authFn(auth);

        if (alreadyOwner) {
          setSignerPending({
            kind: auth,
            inProgress: false,
            authedAddress: alreadyOwner,
          });
          return;
        }

        setSignerPending({
          kind: auth,
          inProgress: false,
        });
      } catch (error) {
        console.error(error);
        const errorMessage = getErrorMessage(error);
        setSignerPending({
          kind: auth,
          inProgress: false,
          error: errorMessage,
        });
      }
    },
    [setSignerPending],
  );

  const handleClose = useCallback(() => {
    setSignerPending(null);
    setSmsState(null);
    setWallets(false);
    onClose();
  }, [setSignerPending, setSmsState, setWallets, onClose]);

  const handleInitOtp = useCallback(
    async (phoneNumber: string) => {
      setSmsState({ phoneNumber, otpId: "", otpEncryptionTargetBundle: "" });
      const { otpId, otpEncryptionTargetBundle } = await smsAuth.initSms({
        phoneNumber,
      });
      setSmsState({ phoneNumber, otpId, otpEncryptionTargetBundle });
    },
    [smsAuth],
  );

  const handleResendOtp = useCallback(async () => {
    if (smsState?.phoneNumber) {
      await handleInitOtp(smsState.phoneNumber);
    }
  }, [handleInitOtp, smsState?.phoneNumber]);

  const handleSubmitSms = useCallback(
    async (otpCode: string) => {
      if (!otpCode || !smsState?.otpId) return;
      const { phoneNumber, otpId, otpEncryptionTargetBundle } = smsState;
      await handleClick("sms", async () => {
        const username = controller?.username();
        if (!controller || !username) {
          throw new Error("No username");
        }
        const { address } = await smsAuth.completeSms(
          username,
          phoneNumber,
          otpId,
          otpEncryptionTargetBundle,
          otpCode,
        );
        if (
          currentSigners?.find(
            (signer) => credentialToAddress(signer) === address,
          )
        ) {
          return address;
        }
        await controller.addOwner(
          { eip191: { address } },
          {
            type: "eip191",
            // otp_id rides inside the opaque credential JSON so the server
            // can prove this signer's phone was just OTP-verified. The
            // GraphQL schema and the controller-wasm bindings don't need
            // to know the field exists; the resolver pulls it out of the
            // raw map, claims the post-verify Redis entry atomically, and
            // strips otp_id before persisting Signer.metadata.
            credential: JSON.stringify({
              provider: "sms",
              eth_address: address,
              otp_id: otpId,
            }),
          },
          null,
        );
      });
    },
    [smsAuth, smsState, controller, currentSigners, handleClick],
  );

  useEffect(() => {
    if (
      signerPending &&
      signerPending.inProgress === false &&
      !signerPending.error &&
      !signerPending.authedAddress
    ) {
      const timer = setTimeout(async () => {
        await controllerQuery.refetch();
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [signerPending, controllerQuery, handleClose]);

  const isChooseOpen = isOpen && signerPending === null && smsState === null;
  const isSmsOpen = isOpen && signerPending === null && smsState !== null;
  const isPendingOpen = isOpen && signerPending !== null;

  return (
    <>
      <Drawer
        isOpen={isChooseOpen}
        onClose={() => {
          if (signerPending || !isChooseOpen) return;
          handleClose();
        }}
      >
        <DrawerContent title="Add Signer" icon={<AddUserIcon />}>
          <div className="flex flex-col gap-3">
            <SignerAlert />
            {wallets ? (
              <>
                <WalletAuths
                  currentSigners={currentSigners}
                  handleClick={handleClick}
                />
                <Button variant="secondary" onClick={() => setWallets(false)}>
                  Back
                </Button>
              </>
            ) : (
              <RegularAuths
                setWallets={setWallets}
                currentSigners={currentSigners}
                handleClick={handleClick}
                onClickSms={() =>
                  setSmsState({
                    phoneNumber: "",
                    otpId: "",
                    otpEncryptionTargetBundle: "",
                  })
                }
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <SmsOtpDrawer
        isOpen={isSmsOpen}
        isLogin={false}
        onClose={handleClose}
        onInitOtp={handleInitOtp}
        onResendOtp={handleResendOtp}
        onSubmitCode={handleSubmitSms}
        smsState={smsState}
      />

      <SignerPendingDrawer
        isOpen={isPendingOpen}
        isLogin={false}
        isLoading={signerPending?.inProgress ?? false}
        error={
          signerPending?.error ? new Error(signerPending.error) : undefined
        }
        authenticationMode={signerPending?.kind as AuthOption | undefined}
        onClose={handleClose}
      />
    </>
  );
}

const WalletAuths = ({
  currentSigners,
  handleClick,
}: {
  currentSigners: CredentialMetadata[] | undefined;
  handleClick: (
    auth: SignerMethodKind,
    authFn: (auth: SignerMethodKind) => Promise<string | undefined>,
  ) => Promise<void>;
}) => {
  const { supportedWalletsForAuth, connectWallet } = useWallets();
  const { controller } = useController();

  const handleClickInner = useCallback(
    async (wallet: SignerMethodKind) => {
      let response: ExternalWalletResponse<unknown> | null = null;
      let signer: Signer | null = null;
      let signerInput: JsAddSignerInput | null = null;
      switch (wallet) {
        case "metamask":
        case "rabby": {
          response = await connectWallet(wallet as ExternalWalletType);
          if (!response || !response.success || !response.account) {
            throw new ExternalWalletError(
              response?.error || "Wallet auth: unknown error",
            );
          }
          signer = { eip191: { address: response.account } };
          signerInput = {
            type: "eip191",
            credential: JSON.stringify({
              provider: wallet,
              eth_address: response.account,
            }),
          };
          break;
        }
        case "phantom":
        case "argent": {
          throw new Error("Wallet not supported");
        }
        case "walletconnect": {
          const walletConnectWallet = new WalletConnectWallet();
          if (!walletConnectWallet) {
            throw new Error("Keychain wallets not found");
          }
          response = await walletConnectWallet.connect();
          if (!response || !response.success || !response.account) {
            throw new ExternalWalletError(
              response?.error || "Wallet auth: unknown error",
            );
          }
          window.keychain_wallets?.addEmbeddedWallet(
            response.account,
            walletConnectWallet,
          );
          signer = { eip191: { address: response.account } };
          signerInput = {
            type: "eip191",
            credential: JSON.stringify({
              provider: wallet,
              eth_address: response.account,
            }),
          };
          break;
        }

        default:
          throw new Error("Wallet not supported");
      }

      if (
        currentSigners?.find(
          (signer) => credentialToAddress(signer) === response.account,
        )
      ) {
        return response.account;
      }
      await controller?.addOwner(signer!, signerInput!, null);
    },
    [currentSigners, controller, connectWallet],
  );

  return (
    <>
      {[...supportedWalletsForAuth, "walletconnect"].map((wallet) => (
        <SignerMethod
          key={wallet as string}
          kind={wallet as SignerMethodKind}
          // existing={isExistingSigner(currentSigners, wallet as AuthOption)} // allow multiple
          onClick={() =>
            handleClick(wallet as SignerMethodKind, handleClickInner)
          }
        />
      ))}
    </>
  );
};

const RegularAuths = ({
  setWallets,
  currentSigners,
  handleClick,
  onClickSms,
}: {
  setWallets: (wallets: boolean) => void;
  currentSigners: CredentialMetadata[] | undefined;
  handleClick: (
    auth: SignerMethodKind,
    authFn: (auth: SignerMethodKind) => Promise<string | undefined>,
  ) => Promise<void>;
  onClickSms: () => void;
}) => {
  const { controller } = useController();

  const handleTurnkeyOAuth = useCallback(
    async (provider: SocialProviderType) => {
      await handleClick(provider, async () => {
        if (!controller?.username()) {
          throw new Error("No username");
        }

        const turnkeyWallet = new TurnkeyWallet(
          controller.username(),
          controller.chainId(),
          controller.rpcUrl(),
          provider,
        );
        const response = await turnkeyWallet.connect(false);
        if (!response || !response.success || !response.account) {
          throw new Error(response?.error || "Wallet auth: unknown error");
        }
        if (response.error?.includes("Account mismatch")) {
          throw new Error("Account mismatch");
        }
        window.keychain_wallets?.addEmbeddedWallet(
          response.account,
          turnkeyWallet as unknown as WalletAdapter,
        );
        if (
          currentSigners?.find(
            (signer) => credentialToAddress(signer) === response.account,
          )
        ) {
          return response.account;
        }

        await controller?.addOwner(
          { eip191: { address: response.account } },
          {
            type: "eip191",
            credential: JSON.stringify({
              provider,
              eth_address: response.account,
            }),
          },
          null,
        );
      });
    },
    [controller, currentSigners, handleClick],
  );

  return (
    <>
      <SignerMethod
        kind="sms"
        existing={isExistingSigner(currentSigners, "sms")}
        onClick={onClickSms}
      />
      <SignerMethod
        kind="passkey"
        // existing={isExistingSigner(currentSigners, "webauthn")} // allow multiple
        onClick={async () => {
          await handleClick("passkey", async () => {
            if (!controller || !controller?.username()) {
              throw new Error(
                `Invalid data: username: ${controller?.username()}`,
              );
            }

            await controller.addOwner(null, null, import.meta.env.VITE_RP_ID);

            return undefined;
          });
        }}
      />
      <SignerMethod
        kind="google"
        // existing={isExistingSigner(currentSigners, "google")} // allow multiple
        onClick={async () => {
          await handleTurnkeyOAuth("google");
        }}
      />
      <SignerMethod
        kind="discord"
        // existing={isExistingSigner(currentSigners, "discord")} // allow multiple
        onClick={async () => {
          await handleTurnkeyOAuth("discord");
        }}
      />
      <SignerMethod
        kind="wallet"
        onClick={() => {
          setWallets(true);
        }}
      />
    </>
  );
};
