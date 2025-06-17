import {
  Outlet,
  Route,
  Routes,
  Navigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Account } from "./account";
import {
  Inventory,
  Collection,
  Collectible,
  CollectionAsset,
  CollectibleAsset,
  SendCollection,
  SendCollectible,
  SendToken,
  Token,
} from "./inventory";
import { Achievements } from "./achievements";
import { Activity } from "./activity";
import { Slot } from "./slot";
import { useMemo } from "react";
import { Socials } from "./socials";
import { Leaderboard } from "./leaderboard";

export function ProfileApp() {
  const [searchParams] = useSearchParams();
  const social = useMemo(() => {
    return searchParams.get("social");
  }, [searchParams]);

  if (social) {
    return <Socials />;
  }

  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="account/:username" element={<Account />}>
          <Route path="inventory" element={<Inventory />}>
            <Route path="token/:address" element={<Token />}>
              <Route path="send" element={<SendToken />} />
            </Route>
          </Route>
          <Route path="activity" element={<Activity />} />

          <Route path="slot/:project" element={<Slot />}>
            <Route path="inventory" element={<Inventory />}>
              <Route path="token/:address" element={<Token />}>
                <Route path="send" element={<SendToken />} />
              </Route>
              <Route path="collection/:address" element={<Collection />}>
                <Route path="token/:tokenId" element={<CollectionAsset />}>
                  <Route path="send" element={<SendCollection />} />
                </Route>
                <Route path="send" element={<SendCollection />} />
              </Route>
              <Route path="collectible/:address" element={<Collectible />}>
                <Route path="token/:tokenId" element={<CollectibleAsset />}>
                  <Route path="send" element={<SendCollectible />} />
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
      </Route>

      <Route path="*" element={<div>Profile page not found</div>} />
    </Routes>
  );
}

function RedirectAchievements() {
  const location = useLocation();
  return (
    <Navigate
      to={location.pathname.replace("trophies", "achievements")}
      replace
    />
  );
}