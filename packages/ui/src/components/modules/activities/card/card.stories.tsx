import type { Meta, StoryObj } from "@storybook/react";
import {
  ActivityCardRow,
  ActivityAchievementCard,
  ActivityGameCard,
  ActivityTokenCard,
  ActivityCollectibleCard,
} from "./";
import { ControllerStack } from "@/utils/mock/controller-stack";

const meta: Meta<typeof ActivityCardRow> = {
  title: "Modules/Activities/Card",
  component: ActivityCardRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ActivityCardRow>;

const now = new Date().getTime();
const seconds_away = now - 10 * 1000;
const minutes_away = now - 60 * 1000;
const hours_away = now - 60 * 60 * 1000;
const days_away = now - 24 * 60 * 60 * 1000;
const weeks_away = now - 2 * 7 * 24 * 60 * 60 * 1000;
const months_away = now - 5 * 30 * 24 * 60 * 60 * 1000;
const years_away = now - 2 * 365 * 24 * 60 * 60 * 1000;

const LS_LOGO =
  "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png";
const LS_COLOR = "#33FF33";
const LORDS_LOGO =
  "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo";
const BEAST_IMAGE =
  "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image";
const PISTOLS_LOGO =
  "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/pistols/icon.png";
const PISTOLS_COLOR = "#EF9758";
const FOOLS_LOGO = "https://assets.underware.gg/pistols/fools.svg";
const DOPE_IMAGE =
  "https://raw2.seadn.io/optimism/0x0e55e1913c50e015e0f60386ff56a4bfb00d7110/448cb89b7c9c6673de179a7d5bef21/b8448cb89b7c9c6673de179a7d5bef21.svg";
const PAPER_LOGO =
  "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/811f019a-0461-4cff-6c1e-442102863f00/logo";
const DUELIST_IMAGE =
  "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image";
const KARAT_IMAGE =
  "https://api.cartridge.gg/x/arcade-main/torii/static/0x07d8ea58612a5de25f29281199a4fc1f2ce42f0f207f93c3a35280605f3b8e68/0x0000000000000000000000000000000000000000000000000000000000000001/image";

export const Game: Story = {
  render: () => (
    <ControllerStack>
      <ActivityGameCard
        action="attack"
        name="Loot Survivor"
        logo={LS_LOGO}
        themeColor={LS_COLOR}
        timestamp={seconds_away}
      />
      <ActivityGameCard
        action="behead_a_beast"
        name="Loot Survivor"
        logo={LS_LOGO}
        themeColor={LS_COLOR}
        timestamp={minutes_away}
        certified
      />
      <ActivityGameCard
        action="commit"
        name="Pistols at Dawn"
        logo={PISTOLS_LOGO}
        themeColor={PISTOLS_COLOR}
        timestamp={seconds_away}
      />
      <ActivityGameCard
        action="create_tutorial_challenge"
        name="Pistols at Dawn"
        logo={PISTOLS_LOGO}
        themeColor={PISTOLS_COLOR}
        timestamp={minutes_away}
        certified
      />
      <ActivityGameCard
        action="attack"
        name="Loot Survivor"
        logo={LS_LOGO}
        themeColor={LS_COLOR}
        timestamp={hours_away}
        loading
      />
      <ActivityGameCard
        action="attack"
        name="Loot Survivor"
        logo={LS_LOGO}
        themeColor={LS_COLOR}
        timestamp={days_away}
        error
      />
    </ControllerStack>
  ),
};

export const Achievement: Story = {
  render: () => (
    <ControllerStack>
      <ActivityAchievementCard
        topic="Beowulf"
        points={12}
        image="fa-chess-knight"
        themeColor={LS_COLOR}
        timestamp={seconds_away}
      />
      <ActivityAchievementCard
        topic="Survived Beast Ambush"
        points={30}
        image="fa-swords"
        themeColor={LS_COLOR}
        timestamp={seconds_away}
      />
      <ActivityAchievementCard
        topic="Shot in the Back"
        points={25}
        image="fa-gun"
        themeColor={PISTOLS_COLOR}
        timestamp={seconds_away}
      />
      <ActivityAchievementCard
        topic="Backflip Pocket Pistol Dodge Surprise"
        points={150}
        image="fa-bolt"
        themeColor={PISTOLS_COLOR}
        timestamp={seconds_away}
        certified
      />
      <ActivityAchievementCard
        topic="Squire"
        points={10}
        image="fa-seedling"
        themeColor={LS_COLOR}
        logo={LS_LOGO}
        timestamp={days_away}
        loading
      />
      <ActivityAchievementCard
        topic="Squire"
        points={10}
        image="fa-seedling"
        themeColor={LS_COLOR}
        logo={LS_LOGO}
        timestamp={days_away}
        error
      />
    </ControllerStack>
  ),
};

export const Token: Story = {
  render: () => (
    <ControllerStack>
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="clicksave"
        amount="100"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        action="send"
        timestamp={seconds_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="reciprodancer"
        amount="1,000"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        action="send"
        timestamp={minutes_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        amount="1,000,000,000,000,000"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        action="receive"
        timestamp={minutes_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="supercalifragilisticexpialidocious"
        amount="1,000"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        action="receive"
        timestamp={minutes_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        amount="100"
        value="$6.04"
        symbol="BEADS"
        image={undefined}
        action="receive"
        timestamp={hours_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="reciprodancer"
        amount="1,000"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        swappedAmount="100"
        swappedImage={FOOLS_LOGO}
        action="swap"
        timestamp={minutes_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="reciprodancer"
        amount="100"
        value="$12.00"
        symbol="FOOLS"
        image={FOOLS_LOGO}
        swappedAmount="99"
        swappedSymbol="BEADS"
        action="swap"
        timestamp={days_away}
      />
      <ActivityTokenCard
        address="0x0"
        amount="100"
        value="$6.04"
        symbol="FOOLS"
        image={FOOLS_LOGO}
        action="mint"
        timestamp={weeks_away}
      />
      <ActivityTokenCard
        address="0x0"
        amount="100"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        action="receive"
        timestamp={weeks_away}
      />
      <ActivityTokenCard
        address="0x0"
        amount="100"
        value="$6.04"
        symbol="FOOLS"
        image={FOOLS_LOGO}
        action="burn"
        timestamp={months_away}
      />
      <ActivityTokenCard
        address="0x0"
        amount="100"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        action="send"
        timestamp={years_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        amount="100,000"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        action="receive"
        timestamp={minutes_away}
        error
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        amount="100"
        value="$6.04"
        symbol="LORDS"
        image={LORDS_LOGO}
        action="send"
        timestamp={seconds_away}
        loading
      />
    </ControllerStack>
  ),
};

export const Collectible: Story = {
  render: () => (
    <ControllerStack>
      <ActivityCollectibleCard
        name={'"Grim Sun" Hippogriff'}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="popsy"
        image={BEAST_IMAGE}
        action="send"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={'"Grim Sun" Hippogriff'}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="supercalifragilisticexpialidocious"
        image={BEAST_IMAGE}
        action="receive"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={"Karat #123"}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        image={KARAT_IMAGE}
        action="receive"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={"Dope Ride"}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="reciprodancer"
        image={DOPE_IMAGE}
        orderAmount="100"
        orderImage={PAPER_LOGO}
        action="list"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={"Dope Ride"}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="reciprodancer"
        image={DOPE_IMAGE}
        orderSymbol="BEADS"
        orderAmount="100"
        action="sell"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={"Pistosl at Dawn Duelist #123"}
        address="0x0"
        image={DUELIST_IMAGE}
        action="mint"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={"Pistosl at Dawn Duelist #123"}
        address="0x0"
        image={DUELIST_IMAGE}
        action="burn"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={"Karat #123"}
        address="0x0"
        image={KARAT_IMAGE}
        action="receive"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={"Karat #123"}
        address="0x0"
        image={KARAT_IMAGE}
        action="send"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={'"Grim Sun" Hippogriff'}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="popsy"
        image={BEAST_IMAGE}
        action="receive"
        timestamp={seconds_away}
        loading
      />
      <ActivityCollectibleCard
        name={'"Grim Sun" Hippogriff'}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        image={BEAST_IMAGE}
        action="receive"
        timestamp={seconds_away}
        error
      />
    </ControllerStack>
  ),
};

export const Arcade: Story = {
  render: () => (
    <div className="flex flex-col gap-3 m-auto">
      <p className="text-center text-lg">Arcade WIP</p>
      <ActivityAchievementCard
        topic="Beowulf"
        points={20}
        image="fa-chess-knight"
        themeColor={LS_COLOR}
        logo={LS_LOGO}
        timestamp={seconds_away}
        certified
      />
      <ActivityAchievementCard
        topic="Shot in the Back"
        points={20}
        image="fa-gun"
        themeColor={PISTOLS_COLOR}
        logo={PISTOLS_LOGO}
        timestamp={seconds_away}
        certified
      />
      <ActivityCollectibleCard
        name={'"Grim Sun" Hippogriff'}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="popsy"
        image={BEAST_IMAGE}
        logo={LS_LOGO}
        action="send"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={'"Grim Sun" Hippogriff'}
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        image={BEAST_IMAGE}
        logo={LS_LOGO}
        action="receive"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={'"Grim Sun" Hippogriff'}
        address="0x0"
        image={BEAST_IMAGE}
        logo={LS_LOGO}
        action="mint"
        timestamp={seconds_away}
      />
      <ActivityCollectibleCard
        name={'"Grim Sun" Hippogriff'}
        address="0x0"
        image={BEAST_IMAGE}
        logo={LS_LOGO}
        action="burn"
        timestamp={seconds_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        username="reciprodancer"
        amount="100"
        value="$6.04"
        image={FOOLS_LOGO}
        logo={PISTOLS_LOGO}
        action="send"
        timestamp={weeks_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        amount="100"
        value="$6.04"
        image={FOOLS_LOGO}
        logo={PISTOLS_LOGO}
        action="receive"
        timestamp={months_away}
      />
      <ActivityTokenCard
        address="0x0"
        amount="100"
        value="$6.04"
        image={FOOLS_LOGO}
        logo={PISTOLS_LOGO}
        action="mint"
        timestamp={days_away}
      />
      <ActivityTokenCard
        address="0x0"
        amount="100"
        value="$6.04"
        image={FOOLS_LOGO}
        logo={PISTOLS_LOGO}
        action="burn"
        timestamp={days_away}
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        amount="100"
        value="$6.04"
        image={LORDS_LOGO}
        logo={PISTOLS_LOGO}
        action="receive"
        timestamp={minutes_away}
        error
      />
      <ActivityTokenCard
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        amount="100"
        value="$6.04"
        image={LORDS_LOGO}
        logo={PISTOLS_LOGO}
        action="send"
        timestamp={seconds_away}
        loading
      />
    </div>
  ),
};
