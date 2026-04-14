import { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/primitives/button";
import { ArrowToLineIcon, CoinsIcon, GiftIcon, Separator } from "@/components";
import { ControllerStack } from "@/utils/mock/controller-stack";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "label",
    },
    disabled: {
      control: "boolean",
      description: "Gray out a button when disabled",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading indicator.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: () => (
    <ControllerStack>
      <Button>Primary</Button>
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading</Button>
      <Separator className="bg-background-400" />
      <Button>
        <CoinsIcon variant="solid" size="sm" /> Primary + Icon
      </Button>
      <Button disabled>
        <CoinsIcon variant="solid" size="sm" /> Disabled
      </Button>
      <Button isLoading>
        <CoinsIcon variant="solid" size="sm" /> Loading
      </Button>
      <Separator className="bg-background-400" />
      <Button variant="secondary">Secondary</Button>
      <Button variant="secondary" disabled>
        Disabled
      </Button>
      <Button variant="secondary" isLoading>
        Loading
      </Button>
      <Separator className="bg-background-400" />
      <Button variant="secondary">
        <CoinsIcon variant="solid" size="sm" /> Secondary + Icon
      </Button>
      <Button variant="secondary" disabled>
        <CoinsIcon variant="solid" size="sm" /> Disabled
      </Button>
      <Button variant="secondary" isLoading>
        <CoinsIcon variant="solid" size="sm" /> Loading
      </Button>
      <Separator className="bg-background-400" />
      <Button variant="destructive">Destructive</Button>
      <Button variant="destructive" disabled>
        Disabled
      </Button>
      <Button variant="destructive" isLoading>
        Loading
      </Button>
      <Separator className="bg-background-400" />
      <Button variant="destructive">
        <CoinsIcon variant="solid" size="sm" /> Destructive + Icon
      </Button>
      <Button variant="destructive" disabled>
        <CoinsIcon variant="solid" size="sm" /> Disabled
      </Button>
      <Button variant="destructive" isLoading>
        <CoinsIcon variant="solid" size="sm" /> Loading
      </Button>
      <Separator className="bg-background-400" />
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="tertiary" isActive>
        Active
      </Button>
      <Button variant="tertiary" disabled>
        Disabled
      </Button>
      <Button variant="tertiary" isLoading>
        Loading
      </Button>
      <Separator className="bg-background-400" />
      <Button variant="tertiary">
        <CoinsIcon variant="solid" size="sm" /> Tertiary + Icon
      </Button>
      <Button variant="tertiary" isActive>
        <CoinsIcon variant="solid" size="sm" /> Active
      </Button>
      <Button variant="tertiary" disabled>
        <CoinsIcon variant="solid" size="sm" /> Disabled
      </Button>
      <Button variant="tertiary" isLoading>
        <CoinsIcon variant="solid" size="sm" /> Loading
      </Button>
      <Separator className="bg-background-400" />
      <h3>With Quantity</h3>
      <Button quantity="2">Primary</Button>
      <Button quantity="2" disabled>
        Disabled
      </Button>
      <Button quantity="2" variant="secondary">
        Secondary
      </Button>
      <Button quantity="2" variant="secondary" disabled>
        Disabled
      </Button>
      <Button quantity="2" variant="destructive">
        Destructive
      </Button>
      <Button quantity="2" variant="destructive" disabled>
        Disabled
      </Button>
    </ControllerStack>
  ),
};

export const Primary: Story = {
  args: {
    children: "sign up",
  },
};

export const PrimaryLoading: Story = {
  args: {
    children: "sign up",
    isLoading: true,
  },
};

export const PrimaryDisabled: Story = {
  args: {
    children: "sign up",
    disabled: true,
  },
};

export const PrimaryWithIcon: Story = {
  args: {
    children: (
      <>
        <CoinsIcon variant="solid" size="sm" /> sign up
      </>
    ),
  },
};

export const PrimaryWithIconDisabled: Story = {
  args: {
    children: (
      <>
        <CoinsIcon variant="solid" size="sm" /> sign up
      </>
    ),
    disabled: true,
  },
};

export const PrimaryWithQuantity: Story = {
  args: {
    children: "sign up",
    quantity: "2",
  },
};

export const Secondary: Story = {
  args: {
    children: "skip",
    variant: "secondary",
  },
};

export const SecondaryLoading: Story = {
  args: {
    children: "skip",
    variant: "secondary",
    isLoading: true,
  },
};

export const SecondaryDisabled: Story = {
  args: {
    children: "skip",
    disabled: true,
    variant: "secondary",
  },
};

export const SecondaryWithIcon: Story = {
  args: {
    children: (
      <>
        <CoinsIcon variant="solid" size="sm" /> skip
      </>
    ),
    variant: "secondary",
  },
};

export const SecondaryWithIconDisabled: Story = {
  args: {
    children: (
      <>
        <CoinsIcon variant="solid" size="sm" /> skip
      </>
    ),
    disabled: true,
    variant: "secondary",
  },
};

export const SecondaryWithQuantity: Story = {
  args: {
    children: "skip",
    quantity: "2",
    variant: "secondary",
  },
};

export const Tertiary: Story = {
  args: {
    children: "$1",
    variant: "tertiary",
  },
};

export const TertiaryLoading: Story = {
  args: {
    children: "$1",
    variant: "tertiary",
    isLoading: true,
  },
};

export const TertiaryActive: Story = {
  args: {
    children: "$1",
    variant: "tertiary",
    isActive: true,
  },
};

export const TertiaryWithQuantity: Story = {
  args: {
    children: "$1",
    quantity: "2",
    variant: "tertiary",
  },
};

export const IconDeposit: Story = {
  args: {
    children: <ArrowToLineIcon variant="down" />,
    size: "icon",
    variant: "icon",
  },
};

export const IconToggle: Story = {
  args: {
    children: <GiftIcon variant="line" />,
    size: "icon",
    variant: "icon",
  },
};

export const ThumnailDeposit: Story = {
  args: {
    children: <ArrowToLineIcon variant="down" />,
    size: "thumbnail",
    variant: "icon",
  },
};

export const ThumnailToggle: Story = {
  args: {
    children: <GiftIcon variant="line" />,
    size: "thumbnail",
    variant: "icon",
  },
};

export const ExternalLink: Story = {
  args: {
    children: "View on Voyager",
    variant: "link",
  },
};
