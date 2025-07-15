import { credentialToAddress } from "@/components/connect/types";
import { useController } from "@/hooks/controller";
import { useWallets } from "@/hooks/wallets";
import { PopupCenter } from "@/utils/url";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
import {
  AuthOptions,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "@cartridge/controller";
import {
  JsControllerError,
  JsSignerInput,
  Signer,
} from "@cartridge/controller-wasm";
import {
  AddUserIcon,
  AlertIcon,
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SignerMethod,
  SignerMethodKind,
  SignerPendingCard,
  SignerPendingCardKind,
  Spinner,
} from "@cartridge/ui";
import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QueryObserverResult } from "react-query";
import { useNavigate } from "react-router-dom";
import { SignerAlert } from "../signer-alert";

type SignerPending = {
  kind: SignerMethodKind;
  inProgress: boolean;
  error?: string;
  authedAddress?: string;
};

export function AddSigner({
  controllerQuery,
}: {
  controllerQuery: QueryObserverResult<ControllerQuery>;
}) {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<boolean>(false);
  const [signerPending, setSignerPending] = useState<SignerPending | null>(
    null,
  );
  const [headerIcon, setHeaderIcon] = useState<typeof AddUserIcon | "spinner">(
    AddUserIcon,
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
        setHeaderIcon("spinner");

        const alreadyOwner = await authFn(auth);
        if (alreadyOwner) {
          setSignerPending({
            kind: auth,
            inProgress: false,
            authedAddress: alreadyOwner,
          });
          setHeaderIcon(CheckIcon);
          return;
        }

        setSignerPending({
          kind: auth,
          inProgress: false,
        });
        setHeaderIcon(CheckIcon);
      } catch (error) {
        console.error(error);
        const errorMessage =
          error instanceof Error || error instanceof JsControllerError
            ? error.message
            : "Unknown error";
        setSignerPending({
          kind: auth,
          inProgress: false,
          error: errorMessage,
        });
        setHeaderIcon(AlertIcon);
      }
    },
    [setSignerPending, setHeaderIcon],
  );

  useEffect(() => {
    if (
      signerPending &&
      signerPending.inProgress === false &&
      !signerPending.error &&
      !signerPending.authedAddress
    ) {
      setTimeout(async () => {
        await controllerQuery.refetch();
        navigate("/settings");
      }, 2000);
    }
  }, [signerPending, signerPending?.inProgress, controllerQuery, navigate]);

  return (
    <>
      <HeaderInner
        icon={<AddUserIcon />}
        variant="compressed"
        title="Add Signer"
        hideIcon
      />
      <LayoutContent className="flex flex-col gap-3 w-full h-fit">
        {!signerPending && <SignerAlert />}
        {signerPending ? (
          <SignerPendingCard
            kind={signerPending.kind as SignerPendingCardKind}
            inProgress={signerPending.inProgress}
            error={signerPending.error}
            authedAddress={signerPending.authedAddress}
          />
        ) : wallets ? (
          <WalletAuths
            currentSigners={controllerQuery.data?.controller?.signers?.map(
              (signer) => signer.metadata as CredentialMetadata,
            )}
            handleClick={handleClick}
          />
        ) : (
          <RegularAuths
            setWallets={setWallets}
            currentSigners={controllerQuery.data?.controller?.signers?.map(
              (signer) => signer.metadata as CredentialMetadata,
            )}
            handleClick={handleClick}
          />
        )}
      </LayoutContent>

      <LayoutFooter>
        {(wallets || signerPending?.error) && (
          <Button
            variant="secondary"
            onClick={() => {
              if (signerPending?.error || signerPending?.authedAddress) {
                setSignerPending(null);
                setHeaderIcon(AddUserIcon);
              } else {
                setWallets(false);
              }
            }}
          >
            Cancel
          </Button>
        )}
        {!wallets && !signerPending && (
          <Button variant="secondary" onClick={() => navigate("/settings")}>
            Back
          </Button>
        )}
      </LayoutFooter>
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
  ) => void;
}) => {
  const { wallets, connectWallet } = useWallets();
  const { controller } = useController();
  const supportedWallets = useMemo(
    () =>
      [
        ...wallets
          .filter(
            (wallet) => wallet.type !== "argent" && wallet.type !== "phantom",
          )
          .map((wallet) => wallet.type),
        "walletconnect",
      ] as AuthOptions,
    [wallets],
  );

  const handleClickInner = useCallback(
    async (wallet: SignerMethodKind) => {
      let response: ExternalWalletResponse<unknown> | null = null;
      let signer: Signer | null = null;
      let signerInput: JsSignerInput | null = null;
      switch (wallet) {
        case "metamask":
        case "rabby": {
          response = await connectWallet(wallet as ExternalWalletType);
          if (!response || !response.success || !response.account) {
            throw new Error(response?.error || "Wallet auth: unknown error");
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
            throw new Error(response?.error || "Wallet auth: unknown error");
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
      await controller?.addOwner(signer!, signerInput!);
    },
    [currentSigners, controller],
  );

  return (
    <>
      {supportedWallets.map((wallet) => (
        <SignerMethod
          key={wallet as string}
          kind={wallet as SignerMethodKind}
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
}: {
  setWallets: (wallets: boolean) => void;
  currentSigners: CredentialMetadata[] | undefined;
  handleClick: (
    auth: SignerMethodKind,
    authFn: (auth: SignerMethodKind) => Promise<string | undefined>,
  ) => void;
}) => {
  const { controller } = useController();

  return (
    <>
      <SignerMethod
        kind="passkey"
        onClick={async () => {
          await handleClick("passkey", async () => {
            if (!controller?.username()) {
              throw new Error("No username");
            }

            const isSafari = /^((?!chrome|android).)*safari/i.test(
              navigator.userAgent,
            );
            if (isSafari) {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set(
                "name",
                encodeURIComponent(controller?.username() ?? ""),
              );
              searchParams.set(
                "appId",
                encodeURIComponent(controller?.appId() ?? ""),
              );
              searchParams.set("action", "add-signer");

              PopupCenter(
                `/authenticate?${searchParams.toString()}`,
                "Cartridge Add Signer",
                480,
                640,
              );

              return undefined;
            }
          });
        }}
      />
      {/* <SignerMethod
        kind="google"
        onClick={() => {}}
      /> */}
      <SignerMethod
        kind="discord"
        onClick={async () => {
          await handleClick("discord", async () => {
            if (!controller?.username()) {
              throw new Error("No username");
            }

            const turnkeyWallet = new TurnkeyWallet();
            const response = await turnkeyWallet.connect(controller.username());
            if (!response || !response.success || !response.account) {
              throw new Error(response?.error || "Wallet auth: unknown error");
            }
            if (response.error?.includes("Account mismatch")) {
              throw new Error("Account mismatch");
            }
            window.keychain_wallets?.addEmbeddedWallet(
              response.account,
              turnkeyWallet as WalletAdapter,
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
                  provider: "discord",
                  eth_address: response.account,
                }),
              },
            );
          });
        }}
      />
      {/* <SignerMethod
        kind="SMS"
        onClick={() => {}}
      /> */}
      <SignerMethod
        kind="wallet"
        onClick={() => {
          setWallets(true);
        }}
      />
    </>
  );
};
