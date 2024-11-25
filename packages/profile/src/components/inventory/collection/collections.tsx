import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@cartridge/ui-next";
import {
  Erc721__Token,
  useErc721BalancesQuery,
} from "@cartridge/utils/api/indexer";
import { useAccount } from "@/hooks/account";
import { LayoutContentError, LayoutContentLoader } from "@/components/layout";
import { useMemo } from "react";
import { useIndexerAPI } from "@cartridge/utils";

type Collection = {
  address: string;
  name: string;
  totalCount: number;
  imageUrl: string;
};

export function Collections() {
  const { address } = useAccount();
  const { status, data } = useErc721BalancesQuery({ address });
  const { indexerUrl } = useIndexerAPI();

  const collections = useMemo(() => {
    if (!data) return [];

    const cols =
      data.tokenBalances?.edges.reduce<Record<string, Collection>>(
        (prev, e) => {
          const a = e.node.tokenMetadata as Erc721__Token;
          const p = prev[a.contractAddress];
          const col = p
            ? { ...p, totalCount: p.totalCount + 1 }
            : {
                address: a.contractAddress,
                name: a.name,
                totalCount: 1,
                imageUrl: `${indexerUrl.replace("/graphql", "")}/static/${
                  a.imagePath
                }`,
              };

          return {
            ...prev,
            [col.address]: col,
          };
        },
        {},
      ) ?? [];

    return Object.values(cols);
  }, [data, indexerUrl]);

  switch (status) {
    case "loading": {
      return <LayoutContentLoader />;
    }
    case "error": {
      return <LayoutContentError />;
    }
    default: {
      return (
        <div className="grid grid-cols-2 gap-2 place-items-center">
          {collections.map((c) => (
            <Link
              className="w-full aspect-square group"
              to={`./collection/${c.address}`}
              key={c.address}
            >
              <Card className="w-full h-full">
                <CardHeader className="flex flex-row gap-1 group-hover:opacity-70 items-center justify-between">
                  <CardTitle className="truncate">{c.name}</CardTitle>
                  <div className="truncate rounded-full min-w-5 h-5 flex justify-center items-center text-xs font-bold bg-accent px-1.5">
                    {c.totalCount}
                  </div>
                </CardHeader>

                <CardContent
                  className="bg-cover bg-center flex p-4 h-full place-content-center overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${c.imageUrl})`,
                  }}
                >
                  <img
                    className="object-contain transition group-hover:scale-110"
                    src={c.imageUrl}
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      );
    }
  }
}
