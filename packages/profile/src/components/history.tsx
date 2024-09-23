import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";

export function History() {
  return (
    <LayoutContainer>
      <LayoutHeader
        title={"click.ctrl"}
        description={"0x0000000...0000000000"}
      />

      <LayoutContent>
        <div>History</div>
      </LayoutContent>
    </LayoutContainer>
  );
}
