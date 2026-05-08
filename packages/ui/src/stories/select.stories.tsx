import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import { Meta, StoryObj } from "@storybook/react";

type SelectVariant = "default" | "input";

const meta: Meta<typeof Select> = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "input"],
    },
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
    variant: "default",
    placeholder: "Theme",
    items: ["Light", "Dark", "System"],
    arrow: false,
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

export const DefaultShort: Story = {
  args: {
    variant: "default",
    placeholder: "Theme",
    items: SHORT_ITEMS,
  },
};

export const DefaultLong: Story = {
  args: {
    variant: "default",
    placeholder: "Country",
    items: LONG_ITEMS,
  },
};

export const InputShort: Story = {
  args: {
    variant: "input",
    placeholder: "Theme",
    items: SHORT_ITEMS,
    arrow: true,
  },
};

export const InputLong: Story = {
  args: {
    variant: "input",
    placeholder: "Country",
    items: LONG_ITEMS,
    arrow: true,
  },
};

export const InputLongDisabled: Story = {
  args: {
    variant: "input",
    placeholder: "Country",
    items: LONG_ITEMS,
    arrow: true,
    disabled: true,
  },
};

function Select({
  variant,
  placeholder,
  items,
  arrow,
  disabled,
}: {
  variant?: SelectVariant;
  placeholder?: string;
  items?: string[];
  arrow?: boolean;
  disabled?: boolean;
}) {
  return (
    <UISelect
      variant={variant}
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
