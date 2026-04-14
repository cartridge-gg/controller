import type { Meta, StoryObj } from "@storybook/react";
import { TokenSummary } from ".";
import { TokenCard } from "@/index";

const meta: Meta<typeof TokenSummary> = {
  title: "Modules/Tokens/Summary",
  component: TokenSummary,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof TokenSummary>;

export const Default: Story = {
  render: () => (
    <TokenSummary title="Tokens">
      <TokenCard
        image={"https://static.cartridge.gg/presets/credit/icon.svg"}
        title={"Credits"}
        amount={"200 Credits"}
        value={"$20.00"}
      />
      <TokenCard
        image={
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo"
        }
        title={"Stark"}
        amount={"0.01 STRK"}
        value={"$31.40"}
        change={"+$1.78"}
      />
      <TokenCard
        image={
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo"
        }
        title={"Ether"}
        amount={"0.01 ETH"}
        value={"$31.40"}
        change={"+$1.78"}
      />
      <TokenCard
        image={
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        }
        title={"Lords"}
        amount={"0.01 LORDS"}
        value={"$31.40"}
        change={"-$1.78"}
      />
      <TokenCard
        image={
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/811f019a-0461-4cff-6c1e-442102863f00/logo"
        }
        title={"Paper"}
        amount={"0.01 PAPER"}
        value={"$31.40"}
        change={"+$1.78"}
      />
      <TokenCard
        image={
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        }
        title={"Lords"}
        amount={"0.01 LORDS"}
        value={"$31.40"}
        decreasing
        clickable={false}
      />
      <TokenCard
        image={
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/811f019a-0461-4cff-6c1e-442102863f00/logo"
        }
        title={"Paper"}
        amount={"0.01 PAPER"}
        value={"$31.40"}
        increasing
        clickable={false}
      />
    </TokenSummary>
  ),
};
