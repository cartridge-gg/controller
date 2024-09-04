import { LayoutContainer, LayoutHeader } from "@/components/layout";

export function Inventory() {
  return (
    <LayoutContainer>
      <LayoutHeader title="" />
      <h1 className="text-3xl font-bold underline text-primary">Inventory</h1>
      {Array.from({ length: 30 }).map((_, i) => (
        <div>line: {i}</div>
      ))}
    </LayoutContainer>
  );
}
