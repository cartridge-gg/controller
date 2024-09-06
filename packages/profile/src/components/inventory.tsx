import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";

export function Inventory() {
  return (
    <LayoutContainer>
      <LayoutHeader
        title={"click.ctrl"}
        description={"0x0000000...0000000000"}
      />

      <LayoutContent>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i}>line: {i}</div>
        ))}
      </LayoutContent>
    </LayoutContainer>
  );
}
