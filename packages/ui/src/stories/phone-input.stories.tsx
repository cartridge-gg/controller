import { PhoneNumberInput as UIPhoneNumberInput } from "@/components/primitives/phone-input";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta<typeof UIPhoneNumberInput> = {
  title: "Primitives/Phone Input",
  component: UIPhoneNumberInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof UIPhoneNumberInput>;

function PhoneNumberInput({
  initialValue = "",
  allowedCountries,
}: {
  initialValue?: string;
  allowedCountries?: string[];
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="w-[320px]">
      <UIPhoneNumberInput
        value={value}
        setValue={setValue}
        allowedCountries={allowedCountries}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <PhoneNumberInput />,
};

const NORTH_AMERICAN_COUNTRIES = ["CA", "US", "MX"];
export const AllowedCountries: Story = {
  render: () => (
    <PhoneNumberInput allowedCountries={NORTH_AMERICAN_COUNTRIES} />
  ),
};

export const SingleCountry: Story = {
  render: () => <PhoneNumberInput allowedCountries={["US"]} />,
};
