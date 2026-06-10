import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader, type SectionHeaderKind } from "./section-header";
import { ControllerContainer } from "@/utils/mock/controller-container";

const meta = {
  title: "Modules/Settings/SectionHeader",
  component: SectionHeaderStory,
  tags: ["autodocs"],
} satisfies Meta<typeof SectionHeaderStory>;

export default meta;

type Story = StoryObj<typeof SectionHeaderStory>;

export const Default: Story = {};

function SectionHeaderStory({ kind }: { kind?: SectionHeaderKind }) {
  const kinds: SectionHeaderKind[] = [
    "sessions",
    "signers",
    "connections",
    "recovery",
    "delegate",
    "registered-account",
    "bank-account",
    "user-data",
    "currency",
    "delete-account",
  ];

  return (
    <ControllerContainer>
      {kind ? (
        <SectionHeader kind={kind} />
      ) : (
        kinds.map((k) => <SectionHeader key={k} kind={k} />)
      )}
    </ControllerContainer>
  );
}
