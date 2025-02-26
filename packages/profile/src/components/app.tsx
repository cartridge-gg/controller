import { Outlet, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Account } from "#components/account";
import {
  Inventory,
  Collection,
  Collectible,
  SendCollection,
  SendToken,
  Token,
} from "#components/inventory";
import { Achievements } from "#components/achievements";
import { Activity } from "#components/activity";
import { Slot } from "#components/slot";

export function App() {
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
                <Route path="token/:tokenId" element={<Collectible />}>
                  <Route path="send" element={<SendCollection />} />
                </Route>
                <Route path="send" element={<SendCollection />} />
              </Route>
            </Route>
            <Route path="achievements" element={<Achievements />}>
              <Route path=":address" element={<Achievements />} />
            </Route>
            <Route path="trophies" element={<RedirectAchievements />}>
              <Route path=":address" element={<RedirectAchievements />} />
            </Route>
            <Route path="activity" element={<Activity />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<div>Page not found</div>} />
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
