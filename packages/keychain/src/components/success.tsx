import { LayoutContainer, CheckIcon, LayoutHeader } from "@cartridge/ui-next";

export function Success() {
  return (
    <LayoutContainer className="pb-12">
      <LayoutHeader
        variant="expanded"
        Icon={CheckIcon}
        title="Success!"
        description=""
        hideNetwork
      />
    </LayoutContainer>
  );
}
