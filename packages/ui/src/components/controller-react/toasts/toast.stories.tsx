import type { Meta, StoryObj } from "@storybook/react";
import {
  AchievementToast,
  MarketplaceToast,
  NetworkToast,
  ErrorToast,
  SuccessToast,
  UserToast,
  SettingToast,
  TransactionToast,
  XPTag,
  ToastProgressBar,
  TOAST_SN_MAIN,
  TOAST_SN_SEPOLIA,
} from "./specialized-toasts";
import { ControllerPresetProvider } from "../controller-toaster/preset-provider";
import { CloseButton } from "./toast";
import { StarknetIcon } from "@/components/icons/brand";

const meta: Meta = {
  title: "Controller React/Toaster/Toast",
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
};

export default meta;

type Story = StoryObj;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-white text-lg font-semibold border-b border-gray-600 pb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {children}
    </div>
  );
}

// A single story rendering every individual toast component (and the
// supporting subcomponents) that make up <ControllerToaster />. All toasts use
// `duration={0}` so they render persistently for inspection / snapshots.
export const AllToasts: Story = {
  render: () => (
    <ControllerPresetProvider>
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section title="Achievement">
          <Item label="Standard (66.7%)">
            <AchievementToast
              title="Pacifist Path"
              subtitle="Earned!"
              xpAmount={100}
              progress={66.7}
              isDraft={false}
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Draft (16.7%)">
            <AchievementToast
              title="Diamonds"
              subtitle="Earned!"
              xpAmount={100}
              progress={16.7}
              isDraft={true}
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Completed (100%)">
            <AchievementToast
              title="Master Strategist"
              subtitle="Completed!"
              xpAmount={250}
              progress={100}
              isDraft={false}
              showClose={false}
              duration={0}
            />
          </Item>
        </Section>

        <Section title="Marketplace">
          <Item label="Single item purchased">
            <MarketplaceToast
              title="Purchased"
              collectionName="Beasts"
              itemNames={["Beast #1024"]}
              itemImages={[
                "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image",
              ]}
              preset="loot-survivor"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Multiple items">
            <MarketplaceToast
              title="Purchased"
              collectionName="Duelists"
              itemNames={["Duelist #111", "Duelist #222", "Duelist #333"]}
              itemImages={[
                "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image",
              ]}
              preset="pistols"
              showClose={false}
              duration={0}
            />
          </Item>
        </Section>

        <Section title="Network">
          <Item label="Connect to Starknet Mainnet">
            <NetworkToast
              kind="connect"
              chainId={TOAST_SN_MAIN}
              networkName="Ignored"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Switch to Starknet Mainnet">
            <NetworkToast
              kind="switch-chain"
              chainId={TOAST_SN_MAIN}
              networkName="Ignored"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Switch to Starknet Mainnet with Icon">
            <NetworkToast
              kind="switch-chain"
              chainId={TOAST_SN_SEPOLIA}
              networkIcon={<StarknetIcon size="default" />}
              networkName="Ignored"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Custom network">
            <NetworkToast
              kind="switch-chain"
              chainId={"0x4B4154414E415F4C4F43414C"} // "KATANA_LOCAL"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Custom network">
            <NetworkToast
              kind="switch-chain"
              chainId={"0x123456"}
              networkName="Nums Chain"
              networkIcon="https://static.cartridge.gg/presets/nums/icon.png"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Custom network">
            <NetworkToast
              kind="switch-chain"
              chainId={"0x123456"}
              networkName="Custom Chain"
              networkIcon={
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  😛
                </div>
              }
              showClose={false}
              duration={0}
            />
          </Item>
        </Section>

        <Section title="Error">
          <Item label="Execution error (66.7%)">
            <ErrorToast
              message="Execution Error"
              progress={66.7}
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Network timeout (30%)">
            <ErrorToast
              message="Network Timeout"
              progress={30}
              showClose={false}
              duration={0}
            />
          </Item>
        </Section>

        <Section title="Success">
          <Item label="Short message">
            <SuccessToast
              message="Address copied"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Long message">
            <SuccessToast
              message="You did something that really remarkable and profound!"
              showClose={false}
              duration={0}
            />
          </Item>
        </Section>

        <Section title="User">
          <Item label="Created">
            <UserToast
              username="clicksave"
              kind="created"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Connected">
            <UserToast
              username="shinobi"
              kind="connected"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Disconnected">
            <UserToast
              username="0xmajor"
              kind="disconnected"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Custom message">
            <UserToast
              username="highlordaributtersworththethirdofcanterburyheightscountymaster"
              kind="connected"
              message="Welcome back!"
              showClose={false}
              duration={0}
            />
          </Item>
        </Section>

        <Section title="Setting">
          <Item label="Signer created">
            <SettingToast
              kind="signer"
              action="created"
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Signer deleted">
            <SettingToast
              kind="signer"
              action="deleted"
              showClose={false}
              duration={0}
            />
          </Item>
        </Section>

        <Section title="Transaction">
          <Item label="Confirming (expanded)">
            <TransactionToast
              status="confirming"
              isExpanded={true}
              label="New Game"
              progress={66.7}
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Confirmed (expanded)">
            <TransactionToast
              status="confirmed"
              isExpanded={true}
              label="Token Swap"
              progress={100}
              showClose={false}
              duration={0}
            />
          </Item>
          <Item label="Collapsed">
            <div className="flex gap-2">
              <TransactionToast
                status="confirming"
                isExpanded={false}
                showClose={false}
                duration={0}
              />
              <TransactionToast
                status="confirmed"
                isExpanded={false}
                showClose={false}
                duration={0}
              />
            </div>
          </Item>
        </Section>

        <Section title="Supporting components">
          <Item label="XP Tag (mainnet / draft)">
            <div className="flex gap-4">
              <XPTag amount={100} isMainnet={true} />
              <XPTag amount={50} isMainnet={false} />
            </div>
          </Item>
          <Item label="Progress Bar (achievement / error)">
            <div className="relative h-6">
              <ToastProgressBar progress={60} variant="achievement" />
            </div>
            <div className="relative h-6">
              <ToastProgressBar progress={40} variant="error" />
            </div>
          </Item>
          <Item label="Close Button (default / translucent)">
            <div className="flex gap-4">
              <CloseButton variant="default" />
              <CloseButton variant="translucent" />
            </div>
          </Item>
        </Section>
      </div>
    </ControllerPresetProvider>
  ),
};
