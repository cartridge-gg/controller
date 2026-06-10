import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PhoneNumberInput as UIPhoneNumberInput } from "@/components/primitives/phone-input";

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
  sourceValue,
  allowedCountries,
  userCountryCode,
}: {
  initialValue?: string;
  sourceValue?: string;
  allowedCountries?: string[];
  userCountryCode?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="w-[320px]">
      <UIPhoneNumberInput
        value={value}
        setValue={setValue}
        sourceValue={sourceValue}
        allowedCountries={allowedCountries}
        userCountryCode={userCountryCode}
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

export const UserCountryCode: Story = {
  render: () => <PhoneNumberInput userCountryCode={"GB"} />,
};

export const UserCountryCodeAsync: Story = {
  render: () => {
    function AsyncUserCountryCode() {
      const [userCountryCode, setUserCountryCode] = useState<
        string | undefined
      >(undefined);
      useEffect(() => {
        const id = setTimeout(() => setUserCountryCode("GB"), 1000);
        return () => clearTimeout(id);
      }, []);
      return <PhoneNumberInput userCountryCode={userCountryCode} />;
    }
    return <AsyncUserCountryCode />;
  },
};

export const UserCountryCodeInvalid: Story = {
  render: () => <PhoneNumberInput userCountryCode={"UK"} />,
};

export const PrefilledFromSource: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <PhoneNumberInput sourceValue="+16123456789" />
      <PhoneNumberInput sourceValue="+19999999999" />
      <PhoneNumberInput sourceValue="+5511954377882" />
      <PhoneNumberInput sourceValue="+2650909302932" />
      <PhoneNumberInput sourceValue="+306123456789" />
      <PhoneNumberInput sourceValue="+330612345678" />
    </div>
  ),
};
