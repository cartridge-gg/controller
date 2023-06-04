import type { Meta } from "@storybook/react";

import { Button } from "@chakra-ui/react";

const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
};

export default meta;

export const Yellow = {
  args: {
    children: "Press me",
    variant: "yellow",
  },
};
