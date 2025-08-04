import { useMemo, useState } from "react";
import { useOwnershipsQuery } from "@cartridge/ui/utils/api/cartridge";
import { useConnection } from "@/hooks/connection";

const LIMIT = 0;

export type Ownership = {
  project: string;
  accountAddress: string;
  contractAddress: string;
  tokenId: string;
  balance: number;
};

interface OwnershipsProps {
  contractAddresses: string[];
  tokenIds: string[];
}

export type UseOwnershipsResponse = {
  ownerships: Ownership[];
  status: "success" | "error" | "idle" | "loading";
};

export function useOwnerships({
  contractAddresses,
  tokenIds,
}: OwnershipsProps): UseOwnershipsResponse {
  const { project } = useConnection();
  const [ownerships, setOwnerships] = useState<{ [key: string]: Ownership }>(
    {},
  );

  const { status } = useOwnershipsQuery(
    {
      projects: [
        {
          project: project ?? "",
          contractAddresses: contractAddresses,
          tokenIds: tokenIds,
          limit: LIMIT,
        },
      ],
    },
    {
      queryKey: ["ownerships", project, contractAddresses, tokenIds],
      enabled: !!project && !!contractAddresses && !!tokenIds,
      onSuccess: ({ ownerships }) => {
        const newOwnerships: { [key: string]: Ownership } = {};
        ownerships?.items.forEach((item) => {
          item.ownerships.forEach(
            ({ accountAddress, contractAddress, tokenId, balance }) => {
              const key = `${contractAddress}-${tokenId}`;
              const ownership: Ownership = {
                project: item.meta.project,
                accountAddress,
                contractAddress,
                tokenId,
                balance: Number(balance),
              };
              newOwnerships[key] = ownership;
            },
          );
        });
        setOwnerships(newOwnerships);
      },
    },
  );

  return { ownerships: Object.values(ownerships), status };
}

interface OwnershipProps {
  contractAddress: string;
  tokenId: string;
}

export type UseOwnershipResponse = {
  ownership: Ownership | undefined;
  status: "success" | "error" | "idle" | "loading";
};

export function useOwnership({
  contractAddress,
  tokenId,
}: OwnershipProps): UseOwnershipResponse {
  const { project } = useConnection();

  const { data, status } = useOwnershipsQuery(
    {
      projects: [
        {
          project: project ?? "",
          contractAddresses: [contractAddress],
          tokenIds: [tokenId],
          limit: LIMIT,
        },
      ],
    },
    {
      queryKey: ["ownership", project, contractAddress, tokenId],
      enabled: !!project && !!contractAddress && !!tokenId,
    },
  );

  const ownership = useMemo(() => {
    if (!data || !contractAddress || !tokenId) return undefined;
    const { ownerships } = data;
    const newOwnerships: { [key: string]: Ownership } = {};
    ownerships.items.forEach((item) => {
      item.ownerships.forEach(
        ({ accountAddress, contractAddress, tokenId, balance }) => {
          const key = `${contractAddress}-${tokenId}`;
          const ownership: Ownership = {
            project: item.meta.project,
            accountAddress,
            contractAddress,
            tokenId,
            balance: Number(balance),
          };
          newOwnerships[key] = ownership;
        },
      );
    });
    return newOwnerships[`${contractAddress}-${tokenId}`];
  }, [data, contractAddress, tokenId]);

  return { ownership, status };
}
