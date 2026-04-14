import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/primitives/button";
import { useToast } from "@/components/primitives/toast/use-toast";

const meta: Meta = {
  title: "Primitives/Toast/Existing Toast System",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#353535" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
};

export default meta;

type Story = StoryObj;

function ExistingToastDemo() {
  const { toast } = useToast();

  const showBasicToast = () => {
    toast({
      title: "Basic Toast",
      description:
        "This is a basic toast notification using the existing system.",
    });
  };

  const showDestructiveToast = () => {
    toast({
      title: "Error Occurred",
      description: "Something went wrong with your request.",
      variant: "destructive",
    });
  };

  const showToastWithAction = () => {
    toast({
      title: "Update Available",
      description: "A new version is available for download.",
      element: (
        <Button variant="outline" size="default">
          Update
        </Button>
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-white text-lg font-semibold mb-4">
        Existing Toast System
      </div>

      <div className="space-y-2">
        <Button onClick={showBasicToast} className="w-full">
          Show Basic Toast
        </Button>
        <Button
          onClick={showDestructiveToast}
          variant="destructive"
          className="w-full"
        >
          Show Error Toast
        </Button>
        <Button
          onClick={showToastWithAction}
          variant="outline"
          className="w-full"
        >
          Show Toast with Action
        </Button>
      </div>

      <div className="text-xs text-gray-400 mt-4">
        These are the existing toast notifications using the original
        Radix-based system
      </div>
    </div>
  );
}

export const ExistingToasts: Story = {
  render: () => <ExistingToastDemo />,
};

export const ComparisonDemo: Story = {
  render: () => (
    <div className="space-y-4 text-white">
      <h2 className="text-lg font-semibold">Toast System Comparison</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium text-blue-400">Existing Toast System</h3>
          <div className="text-sm space-y-2">
            <p>✅ Simple title + description format</p>
            <p>✅ Basic styling variants (default, destructive)</p>
            <p>✅ Action button support</p>
            <p>✅ Auto-dismiss functionality</p>
            <p>✅ Swipe to dismiss</p>
          </div>
          <pre className="bg-gray-800 p-2 rounded text-xs">
            {`toast({
  title: "Success",
  description: "Operation completed",
  variant: "default"
});`}
          </pre>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-green-400">
            Specialized Toast Components
          </h3>
          <div className="text-sm space-y-2">
            <p>✅ Rich visual components with icons</p>
            <p>✅ Animated progress bars</p>
            <p>✅ XP rewards and game-specific data</p>
            <p>✅ Network switching notifications</p>
            <p>✅ Transaction status tracking</p>
            <p>✅ Built on existing toast system</p>
          </div>
          <pre className="bg-gray-800 p-2 rounded text-xs">
            {`toast(showAchievementToast({
  title: "Quest Complete",
  xpAmount: 150,
  progress: 100
}));`}
          </pre>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded">
        <h4 className="font-medium text-yellow-400 mb-2">Best Practices</h4>
        <ul className="text-sm space-y-1">
          <li>
            • Use <strong>existing toasts</strong> for simple notifications and
            confirmations
          </li>
          <li>
            • Use <strong>specialized toasts</strong> for game events,
            achievements, and rich interactions
          </li>
          <li>
            • Both systems work together seamlessly through the same useToast
            hook
          </li>
          <li>
            • All toasts appear in the same viewport with consistent positioning
          </li>
        </ul>
      </div>
    </div>
  ),
};
