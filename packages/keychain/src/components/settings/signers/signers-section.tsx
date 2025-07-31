import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/ui/utils/api/cartridge";

import { useNavigation } from "@/context/navigation";
import { useConnection } from "@/hooks/connection";
import {
  JsRemoveSignerInput,
  Signer,
  signerToGuid,
} from "@cartridge/controller-wasm";
import { Button, PlusIcon, Skeleton } from "@cartridge/ui";
import { useMemo } from "react";
import { QueryObserverResult } from "react-query";
import { constants } from "starknet";
import { SectionHeader } from "../section-header";
import { SignerCard } from "./signer-card";
import { useFeature } from "@/hooks/features";

export const SignersSection = ({
  controllerQuery,
}: {
  controllerQuery: QueryObserverResult<ControllerQuery>;
}) => {
  const { chainId, controller } = useConnection();
  const canAddSigner = useFeature("addSigner");
  const { navigate } = useNavigation();

  const signers = useMemo(() => {
    if (!controllerQuery.data?.controller?.signers) return undefined;
    let oldestSigner: { index: number; createdAt: string } | undefined;

    const signers = controllerQuery.data?.controller?.signers?.map(
      (signer, index) => {
        if (
          !oldestSigner ||
          new Date(signer.createdAt) < new Date(oldestSigner.createdAt)
        ) {
          oldestSigner = { index, createdAt: signer.createdAt };
        }
        return {
          ...signer,
          isOriginal: false,
          isCurrent:
            signerToGuid(toJsSigner(signer.metadata as CredentialMetadata)) ===
            controller?.ownerGuid(),
        };
      },
    );
    if (!oldestSigner) {
      throw new Error("No signers found");
    }

    signers[oldestSigner.index].isOriginal = true;
    if (chainId !== constants.StarknetChainId.SN_MAIN) {
      return [signers[oldestSigner.index]];
    }

    return signers.sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  }, [controllerQuery.data, controller, chainId]);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Signer(s)"
        description="Add authorized signers to your Controller. Each signer provides a secure alternative authentication method."
      />
      <div className="space-y-3">
        {controllerQuery.isLoading ? (
          <LoadingState />
        ) : controllerQuery.isError ? (
          <div>Error</div>
        ) : controllerQuery.isSuccess && controllerQuery.data ? (
          signers?.map((signer, index) => {
            return (
              <SignerCard
                key={`${index}`}
                current={signer.isCurrent}
                signer={signer.metadata as CredentialMetadata}
                isOriginalSigner={signer.isOriginal}
                onDelete={
                  signer.isCurrent
                    ? undefined
                    : async () => {
                        let jsSigner: JsRemoveSignerInput | undefined;
                        switch (signer.metadata.__typename) {
                          case "Eip191Credentials":
                            jsSigner = {
                              type: "eip191",
                              credential: JSON.stringify(
                                signer.metadata.eip191?.[0],
                              ),
                            };
                            break;
                          case "WebauthnCredentials":
                            jsSigner = {
                              type: "webauthn",
                              credential: JSON.stringify({
                                ...signer.metadata.webauthn?.[0],
                                rpId: import.meta.env.VITE_RP_ID,
                              }),
                            };
                            break;
                          case "SIWSCredentials":
                            jsSigner = {
                              type: "siws",
                              credential: JSON.stringify(
                                signer.metadata.siws?.[0],
                              ),
                            };
                            break;
                          case "StarknetCredentials": {
                            jsSigner = {
                              type: "starknet",
                              credential: JSON.stringify(
                                signer.metadata.starknet?.[0],
                              ),
                            };
                            break;
                          }
                          default:
                            throw new Error("Unimplemented");
                        }
                        await controller?.removeSigner(jsSigner);
                        await controllerQuery.refetch();
                        return;
                      }
                }
              />
            );
          })
        ) : (
          <div>No data</div>
        )}
      </div>
      {canAddSigner && (
        <Button
          type="button"
          variant="outline"
          className="bg-background-100 text-foreground-300 gap-1 w-fit px-3 hover:bg-background-200 hover:text-foreground-100 border border-background-200 hover:border-background-200"
          disabled={chainId !== constants.StarknetChainId.SN_MAIN}
          onClick={() => navigate("/settings/add-signer")}
        >
          <PlusIcon size="sm" variant="line" />
          <span className="normal-case font-normal font-sans text-sm">
            {chainId === constants.StarknetChainId.SN_MAIN
              ? "Add Signer"
              : "Must be on Mainnet"}
          </span>
        </Button>
      )}
    </section>
  );
};

const LoadingState = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded" />
    </div>
  );
};

const toJsSigner = (signer: CredentialMetadata): Signer => {
  switch (signer.__typename) {
    case "Eip191Credentials":
      return {
        eip191: {
          address: signer.eip191?.[0]?.ethAddress ?? "",
        },
      };
    case "WebauthnCredentials":
      return {
        webauthn: {
          publicKey: signer.webauthn?.[0]?.publicKey ?? "",
          rpId: import.meta.env.VITE_RP_ID,
          credentialId: signer.webauthn?.[0]?.id ?? "",
        },
      };
    default:
      throw new Error("Unimplemented");
  }
};
