import {
  ArgentColorIcon,
  Button,
  Card,
  CardContent,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  MetaMaskColorIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  Separator,
} from "@cartridge/ui-next";
import { StarterItem } from "./starter-item";
import { CreditCardIcon } from "@cartridge/ui-next";
import { TotalCost } from "./total-cost";
type StarterItemData = {
  title: string;
  description: string;
  price: number;
  image: string;
};

const ITEMS: StarterItemData[] = [
  {
    title: "Village",
    description:
      "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
    price: 5,
    image: "https://r2.quddus.my/Frame%203231.png",
  },
  {
    title: "20 Credits",
    description: "Credits cover service fee(s) in Eternum.",
    price: 0,
    image: "/ERC-20-Icon.svg",
  },
];

export function StarterPack() {
  const balance = 0;

  return (
    <LayoutContainer>
      <LayoutHeader title="Get Starter Pack" />
      <LayoutContent>
        <div className="p-1">
          <h1 className="text-xs font-semibold text-foreground-400">
            You receive
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          {ITEMS.map((item, index) => (
            <StarterItem key={index} {...item} />
          ))}
        </div>
      </LayoutContent>

      <div className="m-1 mx-6">
        <Separator className="bg-spacer" />
      </div>

      <LayoutFooter>
        <Card className="flex flex-row items-center justify-between gap-2">
          <TotalCost price={ITEMS.reduce((acc, item) => acc + item.price, 0)} />
          {balance <= 0 && (
            <CardContent className="relative flex items-center justify-center bg-background-200 w-11 aspect-square rounded">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-background-300 rounded-full">
                <img src="/ERC-20-Icon.svg" className="w-5" />
              </div>
            </CardContent>
          )}
        </Card>
        <Button className="w-full">
          {balance <= 0 && (
            <CreditCardIcon variant="solid" className="size-4" />
          )}
          <span>Purchase</span>
        </Button>
        <div className="w-full flex flex-row gap-3">
          <Button variant="secondary" className="w-full">
            <MetaMaskColorIcon className="size-4" />
          </Button>
          <Button variant="secondary" className="w-full">
            <ArgentColorIcon className="size-4" />
          </Button>
          <Button variant="secondary" className="w-full">
            <RabbyColorIcon className="size-4" />
          </Button>
          <Button variant="secondary" className="w-full">
            <PhantomColorIcon className="size-4" />
          </Button>
        </div>
      </LayoutFooter>
    </LayoutContainer>
  );
}
