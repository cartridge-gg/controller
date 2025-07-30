import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./home";
import { Session } from "./session";
import { Failure } from "./failure";
import { Pending } from "./pending";
import { Slot } from "./slot";
import { Consent, Success } from "./slot/index";
import { Fund } from "./slot/fund";
import { StarterPackWrapper } from "./starterpack";
import { FeatureToggle } from "./feature-toggle";
import { Account } from "@/components/account";
import {
  Inventory,
  Collection,
  Collectible,
  CollectionAsset,
  CollectibleAsset,
  CollectionListing,
  SendCollection,
  SendCollectible,
  SendToken,
  Token,
} from "@/components/inventory";
import { Achievements } from "@/components/achievements";
import { Activity } from "@/components/activity";
import { Leaderboard } from "@/components/leaderboard";
import { CollectionPurchase } from "@/components/inventory/collection/collection-purchase";
import { Socials } from "@/components/socials/index";
import { Settings } from "./settings";
import { Purchase } from "./purchase";
import { PurchaseType } from "@/hooks/payments/crypto";
import { Recovery } from "./settings/Recovery";
import { Delegate } from "./settings/Delegate";
import { AddSignerRoute } from "./settings/AddSignerRoute";
import { Funding } from "./funding";
import { Deposit } from "./funding/Deposit";
import { useNavigation } from "@/context/navigation";
import { CollectibleListing } from "./inventory/collection/collectible-listing";
import { CollectiblePurchase } from "./inventory/collection/collectible-purchase";

export function App() {
  const { navigate } = useNavigation();

  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/recovery" element={<Recovery />} />
        <Route path="/settings/delegate" element={<Delegate />} />
        <Route path="/settings/add-signer" element={<AddSignerRoute />} />
        <Route
          path="/purchase"
          element={<Purchase type={PurchaseType.CREDITS} />}
        />
        <Route path="/funding" element={<Funding />} />
        <Route
          path="/funding/deposit"
          element={
            <Deposit
              onComplete={() => {
                const searchParams = new URLSearchParams(
                  window.location.search,
                );
                const returnTo = searchParams.get("returnTo");
                navigate(returnTo || "/funding");
              }}
            />
          }
        />
        <Route
          path="/funding/credits"
          element={
            <Purchase
              type={PurchaseType.CREDITS}
              onBack={() => {
                const searchParams = new URLSearchParams(
                  window.location.search,
                );
                const returnTo = searchParams.get("returnTo");
                navigate(returnTo || "/funding");
              }}
            />
          }
        />
        <Route path="session" element={<Session />} />
        <Route path="slot" element={<Slot />}>
          <Route path="consent" element={<Consent />} />
          <Route path="fund" element={<Fund />} />
        </Route>
        <Route path="success" element={<Success />} />
        <Route path="failure" element={<Failure />} />
        <Route path="pending" element={<Pending />} />
        <Route
          path="starter-pack/:starterpackId"
          element={<StarterPackWrapper />}
        />
        <Route path="/feature/:name/:action" element={<FeatureToggle />} />
        <Route path="account/:username" element={<Account />}>
          <Route path="inventory" element={<Inventory />} />
          <Route path="following" element={<Socials />} />
          <Route path="followers" element={<Socials />} />
          <Route path="inventory/token/:address" element={<Token />} />
          <Route path="inventory/token/:address/send" element={<SendToken />} />
          <Route
            path="inventory/collection/:address"
            element={<Collection />}
            key="collection"
          />
          <Route
            path="inventory/collection/:address/token/:tokenId"
            element={<CollectionAsset />}
            key="collection-asset"
          />
          <Route
            path="inventory/collection/:address/token/:tokenId/send"
            element={<SendCollection />}
            key="send-collection"
          />
          <Route
            path="inventory/collection/:address/token/:tokenId/list"
            element={<CollectionListing />}
          />
          <Route
            path="inventory/collection/:address/token/:tokenId/purchase"
            element={<CollectionPurchase />}
          />
          <Route
            path="inventory/collection/:address/send"
            element={<SendCollection />}
            key="send-collection-bulk"
          />
          <Route
            path="inventory/collection/:address/list"
            element={<CollectionListing />}
          />
          <Route
            path="inventory/collection/:address/purchase"
            element={<CollectionPurchase />}
          />
          <Route
            path="inventory/collectible/:address"
            element={<Collectible />}
          />
          <Route
            path="inventory/collectible/:address/token/:tokenId"
            element={<CollectibleAsset />}
          />
          <Route
            path="inventory/collectible/:address/token/:tokenId/send"
            element={<SendCollectible />}
          />
          <Route
            path="inventory/collectible/:address/token/:tokenId/list"
            element={<CollectibleListing />}
          />
          <Route
            path="inventory/collectible/:address/token/:tokenId/purchase"
            element={<CollectiblePurchase />}
          />
          <Route path="activity" element={<Activity />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="achievements/:address" element={<Achievements />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="leaderboard/:address" element={<Leaderboard />} />
          <Route path="trophies" element={<RedirectAchievements />} />
          <Route path="trophies/:address" element={<RedirectAchievements />} />

          <Route path="slot/:project/inventory" element={<Inventory />} />
          <Route
            path="slot/:project/inventory/token/:address"
            element={<Token />}
          />
          <Route
            path="slot/:project/inventory/token/:address/send"
            element={<SendToken />}
          />
          <Route
            path="slot/:project/inventory/collection/:address"
            element={<Collection />}
            key="slot-collection"
          />
          <Route
            path="slot/:project/inventory/collection/:address/token/:tokenId"
            element={<CollectionAsset />}
            key="slot-collection-asset"
          />
          <Route
            path="slot/:project/inventory/collection/:address/token/:tokenId/send"
            element={<SendCollection />}
            key="slot-send-collection"
          />
          <Route
            path="slot/:project/inventory/collection/:address/token/:tokenId/list"
            element={<CollectionListing />}
          />
          <Route
            path="slot/:project/inventory/collection/:address/token/:tokenId/purchase"
            element={<CollectionPurchase />}
          />
          <Route
            path="slot/:project/inventory/collection/:address/send"
            element={<SendCollection />}
            key="slot-send-collection-bulk"
          />
          <Route
            path="slot/:project/inventory/collection/:address/list"
            element={<CollectionListing />}
          />
          <Route
            path="slot/:project/inventory/collection/:address/purchase"
            element={<CollectionPurchase />}
          />
          <Route
            path="slot/:project/inventory/collectible/:address"
            element={<Collectible />}
          />
          <Route
            path="slot/:project/inventory/collectible/:address/token/:tokenId"
            element={<CollectibleAsset />}
          />
          <Route
            path="slot/:project/inventory/collectible/:address/token/:tokenId/send"
            element={<SendCollectible />}
          />
          <Route
            path="slot/:project/inventory/collectible/:address/token/:tokenId/list"
            element={<CollectibleListing />}
          />
          <Route
            path="slot/:project/inventory/collectible/:address/token/:tokenId/purchase"
            element={<CollectiblePurchase />}
          />
          <Route path="slot/:project/achievements" element={<Achievements />} />
          <Route
            path="slot/:project/achievements/:address"
            element={<Achievements />}
          />
          <Route path="slot/:project/leaderboard" element={<Leaderboard />} />
          <Route
            path="slot/:project/leaderboard/:address"
            element={<Leaderboard />}
          />
          <Route
            path="slot/:project/trophies"
            element={<RedirectAchievements />}
          />
          <Route
            path="slot/:project/trophies/:address"
            element={<RedirectAchievements />}
          />
          <Route path="slot/:project/activity" element={<Activity />} />
        </Route>
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}

function RedirectAchievements() {
  // FIXME: Temporary until used in production
  const location = useLocation();
  return (
    <Navigate
      to={location.pathname.replace("trophies", "achievements")}
      replace
    />
  );
}
