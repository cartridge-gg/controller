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
import { State } from "..";
import { SectionHeader } from "../section-header";
import { SignerCard } from "./signer-card";

export const SignersSection = ({
  controllerQuery,
  setState,
}: {
  controllerQuery: QueryObserverResult<ControllerQuery>;
  setState: (state: State) => void;
}) => {
  const { chainId, controller } = useConnection();

  const canAddSigner = false;

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
        description="Information associated with registered accounts can be made available to games and applications."
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
          className="text-foreground-300 gap-1 w-fit px-3"
          disabled={chainId !== constants.StarknetChainId.SN_MAIN}
          onClick={() => setState(State.ADD_SIGNER)}
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
