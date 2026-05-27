import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Select> = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: false,
    },
    placeholder: {
      control: "text",
    },
    arrow: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    placeholder: "Theme",
    items: ["Light", "Dark", "System"],
    arrow: true,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

const SHORT_ITEMS = ["Light", "Dark", "System"];

const LONG_ITEMS = [
  "Argentina",
  "Australia",
  "Brazil",
  "Canada",
  "Chile",
  "Denmark",
  "Egypt",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Mexico",
  "Netherlands",
  "Norway",
  "Portugal",
  "Spain",
  "United Kingdom",
  "United States",
];

export const Short: Story = {
  args: {
    placeholder: "Theme",
    items: SHORT_ITEMS,
  },
};

export const Long: Story = {
  args: {
    placeholder: "Country",
    items: LONG_ITEMS,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Country",
    items: LONG_ITEMS,
    disabled: true,
  },
};

function Select({
  placeholder,
  items,
  arrow,
  disabled,
}: {
  placeholder?: string;
  items?: string[];
  arrow?: boolean;
  disabled?: boolean;
}) {
  return (
    <UISelect
      disabled={disabled}
      defaultValue={disabled ? items?.[0]?.toLowerCase() : undefined}
    >
      <SelectTrigger className="w-[240px]" arrow={arrow}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items?.map((item) => (
          <SelectItem key={item} value={item.toLowerCase()}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </UISelect>
  );
}
