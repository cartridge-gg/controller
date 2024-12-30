import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@cartridge/ui-next";
import {
  Erc721__Token,
  useErc721BalancesQuery,
} from "@cartridge/utils/api/indexer";
import { useAccount } from "@/hooks/account";
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
  const { isReady, indexerUrl } = useIndexerAPI();
  const { status, data } = useErc721BalancesQuery(
    { address },
    { enabled: isReady && !!address },
  );

  const collections = useMemo(() => {
    if (!data || !indexerUrl) return [];

    const cols =
      data.tokenBalances?.edges.reduce<Record<string, Collection>>(
        (prev, edge) => {
          const token = edge.node.tokenMetadata as Erc721__Token;
          const agg = prev[token.contractAddress];
          const col = agg
            ? { ...agg, totalCount: agg.totalCount + 1 }
            : {
                address: token.contractAddress,
                name: token.name,
                totalCount: 1,
                imageUrl: `${indexerUrl.replace("/graphql", "")}/static/${
                  token.imagePath
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
    case "loading":
    case "error": {
      return null;
    }
    default: {
      return (
        <div className="grid grid-cols-2 gap-4 place-items-center">
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
