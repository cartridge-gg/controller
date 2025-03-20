import {
  Button,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Separator,
} from "@cartridge/ui-next";
import { LayoutContainer } from "@cartridge/ui-next";

export const PurchaseWithoutBalance = ({ balance }: { balance: number }) => {
  return (
    <LayoutContainer>
      <LayoutHeader title="Get Starter Pack" />
      <LayoutContent>
        <p>To be implemented...</p>
        {balance}
      </LayoutContent>

      <div className="m-1 mx-6">
        <Separator className="bg-spacer" />
      </div>

      <LayoutFooter>
        <Button className="w-full">
          <span>Purchase</span>
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
};
