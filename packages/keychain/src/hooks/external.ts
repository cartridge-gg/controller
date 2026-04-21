import { useEffect, useState } from "react";
import { hash, num } from "starknet";
import { useConnection } from "./connection";

export function useExternalOwners() {
  const { controller } = useConnection();

  const [externalOwners, setExternalOwners] = useState<Array<string>>([]);

  const provider = controller;

  const externalOwnerRegisteredSelector = num.toHex(
    hash.starknetKeccak("ExternalOwnerRegistered"),
  );
  const externalOwnerRemovedSelector = num.toHex(
    hash.starknetKeccak("ExternalOwnerRemoved"),
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!controller) return;

      const external = new Set<string>();
      let continuationToken: string | undefined = "0";

      while (continuationToken && mounted) {
        const events = await controller.provider.getEvents({
          address: controller.address(),
          from_block: { block_number: 1151644 }, // controller class hash deployed
          keys: [
            [externalOwnerRegisteredSelector, externalOwnerRemovedSelector],
          ],
          chunk_size: 100,
          continuation_token:
            continuationToken === "0" ? undefined : continuationToken,
        });

        for (const event of events.events) {
          if (event.keys[0] === externalOwnerRegisteredSelector) {
            external.add(event.data[0]);
          }
          if (event.keys[0] === externalOwnerRemovedSelector) {
            external.delete(event.data[0]);
          }
        }

        continuationToken = events.continuation_token;
      }

      setExternalOwners(Array.from(external.values()));
    };

    init();

    return () => {
      mounted = false;
    };
  }, [
    controller,
    provider,
    externalOwnerRegisteredSelector,
    externalOwnerRemovedSelector,
  ]);

  return { externalOwners };
}
