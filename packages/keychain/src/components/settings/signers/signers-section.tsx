import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/ui/utils/api/cartridge";

import { useConnection } from "@/hooks/connection";
import { Signer, signerToGuid } from "@cartridge/controller-wasm";
import { Button, PlusIcon, Skeleton } from "@cartridge/ui";
import { useMemo } from "react";
import { QueryObserverResult } from "react-query";
import { constants } from "starknet";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../section-header";
import { SignerCard } from "./signer-card";
import { useFeature } from "@/hooks/features";

export const SignersSection = ({
  controllerQuery,
}: {
  controllerQuery: QueryObserverResult<ControllerQuery>;
}) => {
  const { chainId, controller } = useConnection();
  const isFeatureEnabled = useFeature("addSigner");
  const navigate = useNavigate();

  const canAddSigner = isFeatureEnabled;

  const signers = useMemo(
    () =>
      controllerQuery.data?.controller?.signers
        ?.map((signer) => {
          return {
            ...signer,
            isCurrent:
              signerToGuid(
                toJsSigner(signer.metadata as CredentialMetadata),
              ) === controller?.ownerGuid(),
          };
        })
        .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent)),
    [controllerQuery.data, controller],
  );

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
