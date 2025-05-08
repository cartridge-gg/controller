import {
  Command as UICommand,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/primitives/command";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Command> = {
  title: "Primitives/Command",
  component: Command,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Command>;

export const Default: Story = {};

function Command() {
  return (
    <UICommand>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Billing</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </UICommand>
  );
}
