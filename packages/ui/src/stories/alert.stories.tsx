import { AlertIcon, TerminalIcon } from "@/components/icons";
import {
  Alert as UIAlert,
  AlertDescription,
  AlertTitle,
} from "@/components/primitives/alert";

import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Alert> = {
  title: "Primitives/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

function Alert() {
  return (
    <UIAlert>
      {/* <Terminal className="h-4 w-4" /> */}
      <TerminalIcon variant="line" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the cli.
      </AlertDescription>
    </UIAlert>
  );
}

export function AlertDestructive() {
  return (
    <UIAlert variant="destructive">
      <AlertIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </UIAlert>
  );
}
