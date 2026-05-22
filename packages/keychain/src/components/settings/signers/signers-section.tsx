import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/controller-ui/utils/api/cartridge";

import { useConnection } from "@/hooks/connection";
import { isCurrentSigner } from "@/utils/signers";
import { JsRemoveSignerInput } from "@cartridge/controller-wasm";
import {
  Button,
  PlusIcon,
  SectionHeader,
  Skeleton,
} from "@cartridge/controller-ui";
import { useState } from "react";
import { QueryObserverResult } from "react-query";
import { constants } from "starknet";
import { AddSignerDrawer } from "./add-signer/add-signer";
import { SignerCard } from "./signer-card";

export const SignersSection = ({
  controllerQuery,
}: {
  controllerQuery: QueryObserverResult<ControllerQuery>;
}) => {
  const { chainId, controller } = useConnection();
  const [isAddSignerOpen, setIsAddSignerOpen] = useState(false);

  const signers = controllerQuery.data?.controller?.signers;

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
        ) : controller && controllerQuery.isSuccess && signers ? (
          signers.map((signer, index) => {
            const isOriginalSigner = signer.isOriginal;
            const isCurrent = isCurrentSigner(
              signer.metadata as CredentialMetadata,
              controller,
            );
            return (
              <SignerCard
                key={`${index}`}
                current={isCurrent}
                signer={signer.metadata as CredentialMetadata}
                isOriginalSigner={isOriginalSigner}
                onDelete={
                  isCurrent || isOriginalSigner
                    ? undefined
                    : async () => {
                        if (isOriginalSigner) {
                          throw new Error("Cannot delete original signer");
                        }
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

      <Button
        variant="sans"
        className="px-3"
        disabled={chainId !== constants.StarknetChainId.SN_MAIN}
        onClick={() => setIsAddSignerOpen(true)}
      >
        <PlusIcon size="sm" variant="line" />
        {chainId === constants.StarknetChainId.SN_MAIN
          ? "Add Signer"
          : "Must be on Mainnet"}
      </Button>

      <AddSignerDrawer
        isOpen={isAddSignerOpen}
        onClose={() => setIsAddSignerOpen(false)}
        controllerQuery={controllerQuery}
      />
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
