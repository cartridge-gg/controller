export {
  Collection,
  CollectionAsset,
  Collectible,
  CollectibleAsset,
  CollectionListing,
  SendCollection,
  SendCollectible,
} from "./collection";
export { Token } from "./token";
export { SendToken } from "./token/send";

import { LayoutContent, Button } from "@cartridge/ui";
import { Collections } from "./collection";
import { Tokens } from "./token";
import { toast } from "@cartridge/controller";

export function Inventory() {
  const handleToastDemo = () => {
    // Demonstrate different toast variants
    toast({
      variant: "error",
      message: "Transaction failed",
      duration: Number.POSITIVE_INFINITY,
    });

    setTimeout(() => {
      toast({
        variant: "transaction",
        hash: "0x1234567890abcdef1234567890abcdef12345678",
        status: "success",
        amount: "100",
        token: "ETH",
      });
    }, 1000);

    setTimeout(() => {
      toast({
        variant: "network-switch",
        networkName: "Starknet Mainnet",
        networkIcon:
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
      });
    }, 2000);

    setTimeout(() => {
      toast({
        variant: "achievement",
        title: "First Achievement!",
        subtitle: "Earned!",
        xpAmount: 50,
        isDraft: true,
        duration: Number.POSITIVE_INFINITY,
      });
    }, 3000);

    setTimeout(() => {
      toast({
        variant: "marketplace",
        action: "purchased",
        itemName: "Cool NFT #123",
        itemImage: "https://picsum.photos/seed/adventurer/200/200",
      });
    }, 4000);
  };

  return (
    <LayoutContent>
      <div className="mb-4 flex justify-end">
        <Button
          variant="secondary"
          onClick={handleToastDemo}
          className="text-xs"
        >
          Test Toast
        </Button>
      </div>
      <Tokens />
      <Collections />
    </LayoutContent>
  );
}
