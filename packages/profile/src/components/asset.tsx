import { Link, useParams } from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import {
  ArrowIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyText,
} from "@cartridge/ui-next";
import { addAddressPadding } from "starknet";

export function Asset() {
  const { address, tokenId } = useParams<{
    address: string;
    tokenId: string;
  }>();
  const collection = {
    address: address!,
    name: "Blobert",
  };
  const asset = {
    tokenId,
    name: "Blobert #196",
    description: "Blobert #196 is a squire from Realms World",
    imageUrl:
      "data:image/jpeg;base64,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",
    attributes: [
      { type: "property", name: "Armour", value: "Leather Armour" },
      { type: "property", name: "Mask", value: "Dojo" },
      { type: "property", name: "Background", value: "Orange" },
      { type: "property", name: "Jewelry", value: "Silver Ring" },
      { type: "property", name: "Weapon", value: "Banner of Rage" },
    ],
  };

  return (
    <LayoutContainer
      left={
        <Link to={`/collection/${collection.address}`}>
          <Button variant="icon" size="icon">
            <ArrowIcon variant="left" />
          </Button>
        </Link>
      }
    >
      <LayoutHeader
        title={asset.name}
        description={
          <CopyText
            value={collection.name}
            copyValue={addAddressPadding(collection.address)}
          />
        }
        icon={asset.imageUrl ?? "/public/placeholder.svg"}
      />

      <LayoutContent className="pb-4">
        <div className="flex place-content-center">
          <div
            className="w-[60%] aspect-square rounded-lg bg-cover bg-center flex py-4 place-content-center overflow-hidden p-4"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${
                asset.imageUrl ?? "/public/placeholder.svg"
              })`,
            }}
          >
            <img
              className="object-contain"
              src={asset.imageUrl ?? "/public/placeholder.svg"}
            />
          </div>
        </div>

        {asset.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>

            <CardContent>{asset.description}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="h-10 flex flex-row items-center justify-between">
            <CardTitle>Properties</CardTitle>
          </CardHeader>

          <CardContent className="bg-background grid grid-cols-2 gap-0.5 p-0">
            {asset.attributes.map((a) => (
              <div
                key={`${a.type}-${a.name}`}
                className="bg-secondary p-3 flex flex-col gap-1"
              >
                <div className="uppercase text-muted-foreground text-2xs font-bold">
                  {a.name}
                </div>
                <div className="text-xs font-medium">{a.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </LayoutContent>
    </LayoutContainer>
  );
}
