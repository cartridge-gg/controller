import { AccountSearchResultItem } from "@/index";
import { AccountSearchResult } from "@/utils";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof AccountSearchResultItem> = {
  title: "Modules/Create Account/Account Search Result Item",
  component: AccountSearchResultItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    result: {
      id: "create-new-shin",
      type: "create-new",
      username: "shin",
    },
    className: "min-w-0 w-96",
  },
};

export default meta;
type Story = StoryObj<typeof AccountSearchResultItem>;

export const Default: Story = {};

export const ExistingUser: Story = {
  args: {
    result: {
      id: "existing-shinobi",
      type: "existing",
      username: "shinobi",
      points: 20800,
      lastOnline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  },
};

export const ExistingUserWithNoPoints: Story = {
  args: {
    result: {
      id: "existing-shinobi",
      type: "existing",
      username: "shinobi",
      points: 0,
      lastOnline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  },
};

export const NewUser: Story = {
  args: {
    result: {
      id: "create-new-shin",
      type: "create-new",
      username: "shin",
    },
  },
};

export const MultipleResult: Story = {
  render: function MultipleResult() {
    const mockResults = [
      {
        id: "create-new-shin",
        type: "create-new",
        username: "shin",
      },
      {
        id: "existing-shinto",
        type: "existing",
        username: "shinto",
        points: 0,
      },
      {
        id: "existing-shints",
        type: "existing",
        username: "shints",
        points: 20800,
      },
      {
        id: "existing-shinobi",
        type: "existing",
        username: "shinobi",
        points: 20800,
      },
    ] satisfies Array<AccountSearchResult>;

    return (
      <div className="min-w-0 w-96 divide-y divide-spacer-100">
        {mockResults.map((result) => (
          <AccountSearchResultItem key={result.id} result={result} />
        ))}
      </div>
    );
  },
};
