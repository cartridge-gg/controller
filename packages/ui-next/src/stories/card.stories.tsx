import React from "react";
import {
  Card as UICard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardIcon,
} from "@/components/primitives/card";
import { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";

const meta: Meta<typeof Card> = {
  title: "Card",
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

function Card({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  useEffect(() => {
    if (!icon) return;
    document.documentElement.style.setProperty(
      "--theme-icon-url",
      `url("https://x.cartridge.gg/whitelabel/dope-wars/icon.png")`,
    );
  }, [icon]);

  return (
    <UICard>
      <CardHeader icon={icon}>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </UICard>
  );
}
