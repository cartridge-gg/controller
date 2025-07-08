import {
  Navigate,
  Outlet,
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
import { Slot as SlotProfile } from "#profile/components/slot";
import { Leaderboard } from "#profile/components/leaderboard";
import { CollectionPurchase } from "#profile/components/inventory/collection/collection-purchase";
import { useMemo } from "react";
import { Socials } from "#profile/components/socials/index.js";

export function App() {
  const [searchParams] = useSearchParams();
  const social = useMemo(() => {
    return searchParams.get("social");
  }, [searchParams]);

  if (social) {
    return <Socials />;
  }

  return (
    <div style={{ position: "relative" }}>
      <Routes>
        <Route element={<Outlet />}>
          <Route path="/" element={<Home />} />
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
            <Route path="inventory" element={<Inventory />}>
              <Route path="token/:address" element={<Token />}>
                <Route path="send" element={<SendToken />} />
              </Route>
            </Route>
            <Route path="activity" element={<Activity />} />
            <Route path="achievements" element={<Achievements />}>
              <Route path=":address" element={<Achievements />} />
            </Route>
            <Route path="leaderboard" element={<Leaderboard />}>
              <Route path=":address" element={<Leaderboard />} />
            </Route>
            <Route path="trophies" element={<RedirectAchievements />}>
              <Route path=":address" element={<RedirectAchievements />} />
            </Route>

            <Route path="slot/:project" element={<SlotProfile />}>
              <Route path="inventory" element={<Inventory />}>
                <Route path="token/:address" element={<Token />}>
                  <Route path="send" element={<SendToken />} />
                </Route>
                <Route path="collection/:address" element={<Collection />}>
                  <Route path="token/:tokenId" element={<CollectionAsset />}>
                    <Route path="send" element={<SendCollection />} />
                    <Route path="list" element={<CollectionListing />} />
                    <Route path="purchase" element={<CollectionPurchase />} />
                  </Route>
                  <Route path="send" element={<SendCollection />} />
                  <Route path="list" element={<CollectionListing />} />
                  <Route path="purchase" element={<CollectionPurchase />} />
                </Route>
                <Route path="collectible/:address" element={<Collectible />}>
                  <Route path="token/:tokenId" element={<CollectibleAsset />}>
                    <Route path="send" element={<SendCollectible />} />
                    {/* <Route path="list" element={<ListCollectible />} /> */}
                  </Route>
                </Route>
              </Route>
              <Route path="achievements" element={<Achievements />}>
                <Route path=":address" element={<Achievements />} />
              </Route>
              <Route path="leaderboard" element={<Leaderboard />}>
                <Route path=":address" element={<Leaderboard />} />
              </Route>
              <Route path="trophies" element={<RedirectAchievements />}>
                <Route path=":address" element={<RedirectAchievements />} />
              </Route>
              <Route path="activity" element={<Activity />} />
            </Route>
          </Route>
          <Route path="*" element={<div>Page not found</div>} />
        </Route>
      </Routes>
    </div>
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
