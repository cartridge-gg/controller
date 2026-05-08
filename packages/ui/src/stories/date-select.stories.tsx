import {
  DateSelect as UIDateSelect,
  type DateValue,
} from "@/components/primitives/date-select";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta<typeof UIDateSelect> = {
  title: "Primitives/Date Select",
  component: UIDateSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof UIDateSelect>;

function DateSelect() {
  const [value, setValue] = useState<DateValue>({
    year: "",
    month: "",
    day: "",
  });
  return (
    <div className="w-[360px]">
      <UIDateSelect value={value} setValue={setValue} />
    </div>
  );
}

export const Default: Story = {
  render: () => <DateSelect />,
};
