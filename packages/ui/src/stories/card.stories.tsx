import React from "react";
import {
  Card as UICard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardIcon,
  CardListContent,
  CardListItem,
} from "@/components/primitives/card";
import { EthereumIcon } from "@/components/icons";
import { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { PLACEHOLDER } from "@/assets";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: "Card Title",
    description: "Card Description",
  },
};

export const OnlyTitle: Story = {
  args: {
    title: "Card Title",
  },
};

export const IconHeader: Story = {
  args: {
    title: "Card Title",
    icon: <CardIcon />,
  },
};

export const CardList: Story = {
  args: {
    variant: "list",
    title: "Card List Content",
  },
};

function Card({
  variant = "content",
  title,
  description,
  icon,
}: {
  variant?: "content" | "list";
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  useEffect(() => {
    if (!icon) return;
    document.documentElement.style.setProperty(
      "--theme-icon-url",
      `url("https://static.cartridge.gg/presets/slot/icon.svg")`,
    );
  }, [icon]);

  switch (variant) {
    case "content": {
      return (
        <UICard>
          <CardHeader icon={icon}>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </UICard>
      );
    }
    case "list": {
      return (
        <UICard>
          <CardHeader icon={icon}>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>

          <CardListContent>
            <CardListItem>No icon item</CardListItem>

            <CardListItem icon={PLACEHOLDER}>placeholder</CardListItem>

            <CardListItem icon={<EthereumIcon />}>
              <div className="flex items-center gap-2">
                0.01 <span className="text-foreground-400">ETH</span>
              </div>

              <div className="text-foreground-400">$3500.00</div>
            </CardListItem>

            <CardListItem icon="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo">
              <div className="flex items-center gap-2">
                100 <span className="text-foreground-400">STRK</span>
              </div>

              <div className="text-foreground-400">$50.00</div>
            </CardListItem>
          </CardListContent>
        </UICard>
      );
    }
  }
}
