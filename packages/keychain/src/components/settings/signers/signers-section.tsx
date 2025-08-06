import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/ui/utils/api/cartridge";

import { useNavigation } from "@/context/navigation";
import { useConnection } from "@/hooks/connection";
import { isCurrentSigner, sortSignersByCreationDate } from "@/utils/signers";
import { JsRemoveSignerInput } from "@cartridge/controller-wasm";
import { Button, PlusIcon, Skeleton } from "@cartridge/ui";
import { useEffect, useState } from "react";
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
  const [signers, setSigners] = useState<
    Array<
      NonNullable<
        NonNullable<ControllerQuery["controller"]>["signers"]
      >[number] & {
        isCurrent?: boolean;
      }
    >
  >([]);
  const { chainId, controller } = useConnection();
  const canAddSigner = useFeature("addSigner");
  const { navigate } = useNavigation();

  useEffect(() => {
    if (!controller) return;
    const sortedSigners = sortSignersByCreationDate(
      controllerQuery?.data?.controller?.signers ?? [],
    );
    Promise.all(
      sortedSigners.map(async (signer) => {
        const isCurrent = await isCurrentSigner(
          signer.metadata as CredentialMetadata,
          controller,
        );
        return { ...signer, isCurrent };
      }),
    ).then((signers) => {
      setSigners(signers);
    });
  }, [controller, controllerQuery.data?.controller?.signers]);

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
        ) : controller && controllerQuery.isSuccess ? (
          signers.map((signer, index) => {
            // index === 0 is the original signer because data is pre-sorted by createdAt ascending
            const isOriginalSigner = index === 0;
            return (
              <SignerCard
                key={`${index}`}
                current={signer.isCurrent}
                signer={signer.metadata as CredentialMetadata}
                isOriginalSigner={isOriginalSigner}
                onDelete={
                  signer.isCurrent || isOriginalSigner
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
