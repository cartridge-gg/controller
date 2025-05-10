import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cartridge/ui";

const currencies = [
  {
    value: "USD",
  },
  {
    value: "EURO",
  },
  {
    value: "YEN",
  },
];

const CurrencySelect = () => {
  return (
    <Select defaultValue="USD">
      <SelectTrigger className="w-[98px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {currencies.map((item, index) => (
            <SelectItem key={index} value={item.value}>
              {item.value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CurrencySelect;
