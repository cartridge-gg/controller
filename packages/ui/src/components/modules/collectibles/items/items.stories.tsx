import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleItems } from "./items";
import { CollectibleItem } from "@/index";
import { fn } from "@storybook/test";

const meta: Meta<typeof CollectibleItems> = {
  title: "Modules/Collectibles/Items",
  component: CollectibleItems,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleItems>;

export const Default: Story = {
  render: function Render() {
    return (
      <CollectibleItems className="">
        <CollectibleItem
          owner="shinobi"
          quantity={1}
          action="list"
          onActionClick={fn()}
        />
        <CollectibleItem
          owner="yourwurstknightmare"
          quantity={1}
          price="$24"
          expiration="1mo"
          action="unlist"
          onActionClick={fn()}
        />
        <CollectibleItem
          owner="shinobi"
          quantity={1}
          price="24"
          logo="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
          expiration="1mo"
          action="purchase"
          onActionClick={fn()}
        />
      </CollectibleItems>
    );
  },
};
