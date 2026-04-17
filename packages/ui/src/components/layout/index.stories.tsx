import type { Meta } from "@storybook/react";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
  LayoutFooter,
} from "./index";

const meta: Meta<typeof Default> = {
  title: "Layout/Index",
  component: Default,
  tags: ["autodocs"],
} satisfies Meta<typeof LayoutHeader>;

export default meta;

export function Default() {
  return (
    <LayoutContainer>
      <LayoutHeader
        title="Welcome to Keychain"
        description="Secure your digital assets"
      />

      <LayoutContent className="bg-background-500 items-center justify-center">
        &lt;LayoutContent /&gt;
      </LayoutContent>

      <LayoutFooter className="bg-destructive text-foreground-400 flex items-center justify-center">
        &lt;LayoutFooter /&gt;
      </LayoutFooter>
    </LayoutContainer>
  );
}

export function Scroll() {
  return (
    <LayoutContainer>
      <LayoutHeader
        title="Welcome to Keychain"
        description="Secure your digital assets"
      />

      <LayoutContent className="min-h-[800px] bg-background-500 items-center justify-center">
        Long &lt;LayoutContent /&gt;
      </LayoutContent>

      <LayoutFooter className="bg-destructive text-foreground-400 flex items-center justify-center">
        &lt;LayoutFooter /&gt;
      </LayoutFooter>
    </LayoutContainer>
  );
}
