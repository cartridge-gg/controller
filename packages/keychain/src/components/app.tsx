import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Home } from "./home";
import { Authenticate } from "./authenticate";
import { Session } from "./session";
import { Failure } from "./failure";
import { Pending } from "./pending";
import { Consent, Slot, Success } from "./slot";
import { Fund } from "./slot/fund";
import { StarterPackWrapper } from "./starterpack";
import { FeatureToggle } from "./feature-toggle";
import { Account } from "#profile/components/account";
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
} from "#profile/components/inventory";
import { Achievements } from "#profile/components/achievements";
import { Activity } from "#profile/components/activity";
import { Leaderboard } from "#profile/components/leaderboard";
import { CollectionPurchase } from "#profile/components/inventory/collection/collection-purchase";
import { useMemo } from "react";
import { Socials } from "#profile/components/socials/index.js";
import { useConnection } from "@/hooks/connection";
import { CreateController } from "./connect";
import { LoginMode } from "./connect/types";
import { Settings } from "./settings";

export function App() {
  const { controller } = useConnection();
  const [searchParams] = useSearchParams();
  const social = useMemo(() => {
    return searchParams.get("social");
  }, [searchParams]);

  // No controller, send to login
  if (!controller) {
    return <CreateController loginMode={LoginMode.Controller} />;
  }

  if (social) {
    return <Socials />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/settings" element={<Settings />} />
        <Route path="authenticate" element={<Authenticate />} />
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
          <Route path="inventory/token/:address" element={<Token />} />
          <Route path="inventory/token/:address/send" element={<SendToken />} />
          <Route
            path="inventory/collection/:address"
            element={<Collection />}
          />
          <Route
            path="inventory/collection/:address/token/:tokenId"
            element={<CollectionAsset />}
          />
          <Route
            path="inventory/collection/:address/token/:tokenId/send"
            element={<SendCollection />}
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
          />
          <Route
            path="slot/:project/inventory/collection/:address/token/:tokenId"
            element={<CollectionAsset />}
          />
          <Route
            path="slot/:project/inventory/collection/:address/token/:tokenId/send"
            element={<SendCollection />}
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
