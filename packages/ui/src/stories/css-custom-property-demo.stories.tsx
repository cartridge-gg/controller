import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { useCSSCustomProperty } from "@/hooks/theme";
import { Button } from "@/components/primitives/button";

const meta: Meta = {
  title: "Hooks/useCSSCustomProperty",
  component: () => <></>,
  parameters: {
    docs: {
      description: {
        component:
          "Demonstrates the `useCSSCustomProperty` hook that reactively watches for changes to CSS custom properties.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function CSSPropertyDemo() {
  const coverUrl = useCSSCustomProperty("--theme-cover-url");
  const iconUrl = useCSSCustomProperty("--theme-icon-url");
  const primaryColor = useCSSCustomProperty("--primary-100");

  const [counter, setCounter] = React.useState(0);

  const updateProperties = React.useCallback(() => {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];
    const images = [
      "url('https://picsum.photos/800/400?random=1')",
      "url('https://picsum.photos/800/400?random=2')",
      "url('https://picsum.photos/800/400?random=3')",
      "url('https://picsum.photos/800/400?random=4')",
    ];
    const icons = [
      "url('https://picsum.photos/100/100?random=10')",
      "url('https://picsum.photos/100/100?random=11')",
      "url('https://picsum.photos/100/100?random=12')",
      "url('https://picsum.photos/100/100?random=13')",
    ];

    const newCounter = counter + 1;
    setCounter(newCounter);

    // Update CSS custom properties
    document.documentElement.style.setProperty(
      "--primary-100",
      colors[newCounter % colors.length],
    );
    document.documentElement.style.setProperty(
      "--theme-cover-url",
      images[newCounter % images.length],
    );
    document.documentElement.style.setProperty(
      "--theme-icon-url",
      icons[newCounter % icons.length],
    );
  }, [counter]);

  const resetProperties = React.useCallback(() => {
    document.documentElement.style.removeProperty("--primary-100");
    document.documentElement.style.removeProperty("--theme-cover-url");
    document.documentElement.style.removeProperty("--theme-icon-url");
    setCounter(0);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          CSS Custom Property Watcher Demo
        </h2>
        <p className="text-foreground-300">
          This demo shows how the `useCSSCustomProperty` hook reactively updates
          when CSS custom properties change.
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={updateProperties}>
          Update Properties ({counter})
        </Button>
        <Button variant="secondary" onClick={resetProperties}>
          Reset to Default
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-200 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Cover URL</h3>
          <p className="text-xs text-foreground-400 break-all">
            {coverUrl || "not set"}
          </p>
          <div
            className="mt-2 h-20 bg-center bg-cover rounded"
            style={{ backgroundImage: coverUrl || "none" }}
          />
        </div>

        <div className="bg-background-200 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Icon URL</h3>
          <p className="text-xs text-foreground-400 break-all">
            {iconUrl || "not set"}
          </p>
          <div
            className="mt-2 h-20 w-20 bg-center bg-cover rounded"
            style={{ backgroundImage: iconUrl || "none" }}
          />
        </div>

        <div className="bg-background-200 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Primary Color</h3>
          <p className="text-xs text-foreground-400">
            {primaryColor || "default"}
          </p>
          <div
            className="mt-2 h-20 rounded"
            style={{ backgroundColor: primaryColor || "var(--primary-100)" }}
          />
        </div>
      </div>

      <div className="bg-background-300 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Usage Example</h3>
        <pre className="text-xs text-foreground-300 overflow-x-auto">
          {`const coverUrl = useCSSCustomProperty("--theme-cover-url");
const iconUrl = useCSSCustomProperty("--theme-icon-url");
const primaryColor = useCSSCustomProperty("--primary-100");

// These values will automatically update when CSS properties change!`}
        </pre>
      </div>
    </div>
  );
}

export const InteractiveDemo: Story = {
  render: () => <CSSPropertyDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo showing the `useCSSCustomProperty` hook in action. " +
          "Click 'Update Properties' to see how the hook automatically detects and responds to changes in CSS custom properties. " +
          "The displayed values and visual elements update in real-time as the underlying CSS properties change.",
      },
    },
  },
};
