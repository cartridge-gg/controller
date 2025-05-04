import { useMemo, useState } from "react";
import {
  OwnershipProject,
  useOwnershipsQuery,
} from "@cartridge/utils/api/cartridge";
import { useConnection } from "./context";

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

  const projects: OwnershipProject[] = useMemo(() => {
    if (!contractAddresses || !tokenIds) return [];
    return [
      {
        project: project ?? "",
        contractAddresses: contractAddresses,
        tokenIds: tokenIds,
        limit: LIMIT,
      },
    ];
  }, [project, tokenIds, contractAddresses]);

  const { status } = useOwnershipsQuery(
    {
      projects,
    },
    {
      queryKey: ["ownerships", projects],
      enabled: projects.length > 0,
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
  const [ownership, setOwnership] = useState<Ownership | undefined>(undefined);

  const projects: OwnershipProject[] = useMemo(() => {
    if (!contractAddress || !tokenId) return [];
    return [
      {
        project: project ?? "",
        contractAddresses: [contractAddress],
        tokenIds: [tokenId],
        limit: LIMIT,
      },
    ];
  }, [project, tokenId, contractAddress]);

  const { status } = useOwnershipsQuery(
    {
      projects,
    },
    {
      queryKey: ["ownership", projects],
      enabled: projects.length > 0,
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
        setOwnership(newOwnerships[`${contractAddress}-${tokenId}`]);
      },
    },
  );

  return { ownership, status };
}
