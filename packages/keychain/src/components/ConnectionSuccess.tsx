import { CheckIcon, HeaderInner, LayoutContent } from "@cartridge/ui";

export function ConnectionSuccess() {
  return (
    <>
      <HeaderInner
        variant="expanded"
        Icon={CheckIcon}
        title="Connected!"
        hideIcon
      />
      <LayoutContent className="gap-4">
        <div className="flex w-full px-4 py-5 bg-background-200 border border-background-300 rounded">
          <p className="w-full text-sm text-center">
            Successfully connected to your Controller account.
            <br />
            <br />
            This window will close automatically...
          </p>
        </div>
      </LayoutContent>
    </>
  );
}
