import type { Meta, StoryObj } from "@storybook/react";
import {
  AchievementToast,
  NetworkSwitchToast,
  ErrorToast,
  TransactionToast,
} from "@/components/primitives/toast/specialized-toasts";
import { StarknetIcon } from "@/components/icons/brand";

const meta: Meta = {
  title: "Primitives/Toast/Showcase",
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#353535" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const AllToastTypes: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">
          Toast Components Showcase
        </h1>
        <p className="text-gray-400 text-sm">
          All specialized toast components rendered persistently
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievement Toasts */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
            Achievement Toasts
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">
                Standard Achievement (66.7% progress)
              </p>
              <AchievementToast
                title="Pacifist Path"
                subtitle="Earned!"
                xpAmount={100}
                progress={66.7}
                isDraft={false}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Draft Achievement (16.7% progress)
              </p>
              <AchievementToast
                title="Diamonds"
                subtitle="Earned!"
                xpAmount={100}
                progress={16.7}
                isDraft={true}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Completed Achievement (100% progress)
              </p>
              <AchievementToast
                title="Master Strategist"
                subtitle="Completed!"
                xpAmount={250}
                progress={100}
                isDraft={false}
                showClose={false}
                duration={0}
              />
            </div>
          </div>
        </div>

        {/* Network Switch Toasts */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
            Network Switch Toasts
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">Starknet Mainnet</p>
              <NetworkSwitchToast
                networkName="Starknet Mainnet"
                networkIcon={<StarknetIcon size="default" />}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">Custom Network</p>
              <NetworkSwitchToast
                networkName="Nums Chain"
                networkIcon={
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    N
                  </div>
                }
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">Ethereum Mainnet</p>
              <NetworkSwitchToast
                networkName="Ethereum Mainnet"
                networkIcon={
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    E
                  </div>
                }
                showClose={false}
                duration={0}
              />
            </div>
          </div>
        </div>

        {/* Error Toasts */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
            Error Toasts
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">
                Execution Error (66.7% progress)
              </p>
              <ErrorToast
                message="Execution Error"
                progress={66.7}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Network Timeout (30% progress)
              </p>
              <ErrorToast
                message="Network Timeout"
                progress={30}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Transaction Failed (10% progress)
              </p>
              <ErrorToast
                message="Transaction Failed"
                progress={10}
                showClose={false}
                duration={0}
              />
            </div>
          </div>
        </div>

        {/* Transaction Notifications */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
            Transaction Notifications
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">
                Confirming Transaction (66.7% progress)
              </p>
              <TransactionToast
                status="confirming"
                isExpanded={true}
                label="New Game"
                progress={66.7}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Confirmed Transaction (100% progress)
              </p>
              <TransactionToast
                status="confirmed"
                isExpanded={true}
                label="Token Swap"
                progress={100}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">Collapsed States</p>
              <div className="flex gap-2">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Confirming</p>
                  <TransactionToast
                    status="confirming"
                    isExpanded={false}
                    showClose={false}
                    duration={0}
                  />
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Confirmed</p>
                  <TransactionToast
                    status="confirmed"
                    isExpanded={false}
                    showClose={false}
                    duration={0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ToastStack: Story = {
  render: () => (
    <div className="max-w-md mx-auto space-y-4 p-6">
      <div className="text-center mb-6">
        <h2 className="text-white text-xl font-bold mb-2">
          Toast Stack Simulation
        </h2>
        <p className="text-gray-400 text-sm">
          How multiple toasts would appear stacked
        </p>
      </div>

      <div className="space-y-3">
        <AchievementToast
          title="Quest Complete"
          subtitle="Earned!"
          xpAmount={150}
          progress={100}
          isDraft={false}
          showClose={false}
          duration={0}
        />
        <NetworkSwitchToast
          networkName="Ethereum Mainnet"
          networkIcon={
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
          }
          showClose={false}
          duration={0}
        />
        <TransactionToast
          status="confirming"
          isExpanded={true}
          label="Token Swap"
          progress={45}
          showClose={false}
          duration={0}
        />
        <ErrorToast
          message="Network Timeout"
          progress={30}
          showClose={false}
          duration={0}
        />
      </div>
    </div>
  ),
};

export const ProgressStates: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="text-center mb-6">
        <h2 className="text-white text-xl font-bold mb-2">
          Progress Bar States
        </h2>
        <p className="text-gray-400 text-sm">
          Different progress values across toast types
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-white text-sm font-medium mb-3">
            Achievement Progress
          </h3>
          <div className="space-y-2">
            {[10, 25, 50, 75, 100].map((progress) => (
              <div key={progress}>
                <p className="text-gray-400 text-xs mb-1">
                  {progress}% Complete
                </p>
                <AchievementToast
                  title={`Achievement ${progress}%`}
                  subtitle="In Progress"
                  xpAmount={progress}
                  progress={progress}
                  isDraft={progress < 100}
                  showClose={false}
                  duration={0}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white text-sm font-medium mb-3">
            Error Progress
          </h3>
          <div className="space-y-2">
            {[15, 40, 65, 90].map((progress) => (
              <div key={progress}>
                <p className="text-gray-400 text-xs mb-1">
                  {progress}% Progress
                </p>
                <ErrorToast
                  message={`Error at ${progress}%`}
                  progress={progress}
                  showClose={false}
                  duration={0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};

export const DurationGuide: Story = {
  render: () => (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div className="text-center mb-6">
        <h2 className="text-white text-xl font-bold mb-2">
          Duration Guidelines
        </h2>
        <p className="text-gray-400 text-sm">
          Recommended duration settings for different toast types
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">
            Quick Notifications
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            2-3 seconds • Simple confirmations
          </p>

          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs mb-1">Network Switch (3s)</p>
              <NetworkSwitchToast
                networkName="Quick Switch"
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-1">
                Confirmed Transaction (3s)
              </p>
              <TransactionToast
                status="confirmed"
                isExpanded={true}
                label="Quick Action"
                progress={100}
                showClose={false}
                duration={0}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">
            Standard Notifications
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            4-6 seconds • Achievements, progress
          </p>

          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs mb-1">Achievement (4s)</p>
              <AchievementToast
                title="Standard Achievement"
                subtitle="Earned!"
                xpAmount={100}
                progress={75}
                isDraft={false}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-1">Error (5s)</p>
              <ErrorToast
                message="Standard Error"
                progress={50}
                showClose={false}
                duration={0}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">
            Important Notifications
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            6-10 seconds • Critical errors, long processes
          </p>

          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs mb-1">
                Confirming Transaction (8s)
              </p>
              <TransactionToast
                status="confirming"
                isExpanded={true}
                label="Important Process"
                progress={40}
                showClose={false}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-1">Critical Error (10s)</p>
              <ErrorToast
                message="Critical System Error"
                progress={20}
                showClose={false}
                duration={0}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">
            Persistent Toasts
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            Manual dismiss • Requires user action
          </p>

          <div className="space-y-2">
            <div>
              <p className="text-gray-400 text-xs mb-1">Manual Dismiss Only</p>
              <AchievementToast
                title="Persistent Achievement"
                subtitle="Click to dismiss"
                xpAmount={500}
                progress={100}
                isDraft={false}
                showClose={false}
                duration={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WithCloseButtons: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">
          Toast Components with Close Buttons
        </h1>
        <p className="text-gray-400 text-sm">
          Interactive toast components showing close button functionality
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievement Toasts */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
            Achievement Toasts
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">
                Standard Achievement with Close Button
              </p>
              <AchievementToast
                title="Pacifist Path"
                subtitle="Earned!"
                xpAmount={100}
                progress={66.7}
                isDraft={false}
                showClose={true}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Draft Achievement with Close Button
              </p>
              <AchievementToast
                title="Diamonds"
                subtitle="Earned!"
                xpAmount={100}
                progress={16.7}
                isDraft={true}
                showClose={true}
                duration={0}
              />
            </div>
          </div>
        </div>

        {/* Network Switch Toasts */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
            Network Switch Toasts
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">
                Starknet Mainnet with Close Button
              </p>
              <NetworkSwitchToast
                networkName="Starknet Mainnet"
                networkIcon={<StarknetIcon size="default" />}
                showClose={true}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Custom Network with Close Button
              </p>
              <NetworkSwitchToast
                networkName="Ethereum Mainnet"
                networkIcon={
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    E
                  </div>
                }
                showClose={true}
                duration={0}
              />
            </div>
          </div>
        </div>

        {/* Error Toasts */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
            Error Toasts
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">
                Execution Error with Close Button
              </p>
              <ErrorToast
                message="Execution Error"
                progress={66.7}
                showClose={true}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Network Timeout with Close Button
              </p>
              <ErrorToast
                message="Network Timeout"
                progress={30}
                showClose={true}
                duration={0}
              />
            </div>
          </div>
        </div>

        {/* Transaction Notifications */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
            Transaction Notifications
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">
                Confirming Transaction with Close Button
              </p>
              <TransactionToast
                status="confirming"
                isExpanded={true}
                label="New Game"
                progress={66.7}
                showClose={true}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Confirmed Transaction with Close Button
              </p>
              <TransactionToast
                status="confirmed"
                isExpanded={true}
                label="Token Swap"
                progress={100}
                showClose={true}
                duration={0}
              />
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-2">
                Collapsed States (no close buttons)
              </p>
              <div className="flex gap-2">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Confirming</p>
                  <TransactionToast
                    status="confirming"
                    isExpanded={false}
                    showClose={false}
                    duration={0}
                  />
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Confirmed</p>
                  <TransactionToast
                    status="confirmed"
                    isExpanded={false}
                    showClose={false}
                    duration={0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-white text-sm font-medium mb-2">
          Close Button Behavior
        </h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>
            • <strong>Achievement & Transaction toasts:</strong> Standard close
            button (gray hover state)
          </li>
          <li>
            • <strong>Error toasts:</strong> Translucent close button (darker on
            hover)
          </li>
          <li>
            • <strong>Network toasts:</strong> Standard close button positioned
            on the right
          </li>
          <li>
            • <strong>Collapsed transaction toasts:</strong> No close button
            (too small)
          </li>
        </ul>
      </div>
    </div>
  ),
};
