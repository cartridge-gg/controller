import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@cartridge/ui-next";
import { CollectionImage } from "./image";
import { useCollections } from "#hooks/collection";

export function Collections() {
  const { collections, status } = useCollections();

  switch (status) {
    case "loading":
    case "error": {
      return null;
    }
    default: {
      return (
        <div className="grid grid-cols-2 gap-4 place-items-center select-none">
          {collections.map((collection) => (
            <Link
              className="w-full aspect-square group select-none"
              draggable={false}
              to={`./collection/${collection.address}`}
              key={collection.address}
            >
              <Card className="w-full h-full">
                <CardHeader className="flex flex-row gap-1 group-hover:opacity-70 items-center justify-between">
                  <CardTitle className="truncate">{collection.name}</CardTitle>
                  <div className="truncate rounded-full min-w-5 h-5 flex justify-center items-center text-xs font-bold bg-background-500 px-1.5">
                    {collection.totalCount}
                  </div>
                </CardHeader>

                <CollectionImage imageUrl={collection.imageUrl || undefined} />
              </Card>
            </Link>
          ))}
        </div>
      );
    }
  }
}
