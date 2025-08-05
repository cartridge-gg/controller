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
    const init = async () => {
      if (!controller) return;

      const events = await controller.provider.getEvents({
        address: controller.address(),
        from_block: { block_number: 0 },
        keys: [[externalOwnerRegisteredSelector, externalOwnerRemovedSelector]],
        chunk_size: 100,
      });

      const external = new Set<string>();

      for (const event of events.events) {
        if (event.keys[0] === externalOwnerRegisteredSelector) {
          external.add(event.data[0]);
        }
        if (event.keys[0] === externalOwnerRemovedSelector) {
          external.delete(event.data[0]);
        }
      }

      setExternalOwners(Array.from(external.values()));
    };

    init();
  }, [
    controller,
    provider,
    externalOwnerRegisteredSelector,
    externalOwnerRemovedSelector,
  ]);

  return { externalOwners };
}
