import { SectionHeader } from "@cartridge/controller-ui";
import CurrencySelect from "./currency-select";

export function CurrencySection() {
  return (
    <section className="space-y-4">
      <SectionHeader kind="currency" />
      <CurrencySelect />
    </section>
  );
}
