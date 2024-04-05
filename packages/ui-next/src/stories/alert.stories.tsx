import {
  Alert as UIAlert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, Terminal } from "lucide-react";

const meta: Meta<typeof Alert> = {
  title: "Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

function Alert() {
  return (
    <UIAlert>
      <Terminal className="h-4 w-4" />
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
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </UIAlert>
  );
}
