import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";

export function Quest() {
  return (
    <LayoutContainer>
      <LayoutHeader
        title={"click.ctrl"}
        description={"0x0000000...0000000000"}
      />

      <LayoutContent>
        <div>Quest</div>
      </LayoutContent>
    </LayoutContainer>
  );
}
