import {
  ControllerQuery,
  CredentialMetadata,
} from "@cartridge/ui/utils/api/cartridge";

import { Skeleton } from "@cartridge/ui";
import { QueryObserverResult } from "react-query";
import { SectionHeader } from "../section-header";
import { SignerCard } from "./signer-card";

export const SignersSection = ({
  controllerQuery,
}: {
  controllerQuery: QueryObserverResult<ControllerQuery>;
}) => {
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
          controllerQuery.data?.controller?.signers?.map((signer, index) => {
            return (
              <SignerCard
                key={`${index}`}
                signer={signer.metadata as CredentialMetadata}
              />
            );
          })
        ) : (
          <div>No data</div>
        )}
      </div>
      {/* disabled until add signer functionality is implemented */}
      {/* <Button */}
      {/*   type="button" */}
      {/*   variant="outline" */}
      {/*   className="py-2.5 px-3 text-foreground-300 gap-1" */}
      {/* > */}
      {/*   <PlusIcon size="sm" variant="line" /> */}
      {/*   <span className="normal-case font-normal font-sans text-sm"> */}
      {/*     Add Signer */}
      {/*   </span> */}
      {/* </Button> */}
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
