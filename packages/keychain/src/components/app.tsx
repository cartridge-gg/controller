import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./home";
import { Session } from "./session";
import { Failure } from "./failure";
import { Pending } from "./pending";
import { Slot } from "./slot";
import { Consent, Success } from "./slot/index";
import { Fund } from "./slot/fund";
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
import { Recovery } from "./settings/Recovery";
import { Delegate } from "./settings/Delegate";
import { AddSignerRoute } from "./settings/AddSignerRoute";
import { PurchaseStarterpack } from "./purchasenew/starterpack/starterpack";
import { PaymentMethod } from "./purchasenew/method";
import { StripeCheckout } from "./purchasenew/checkout/stripe";
import { PurchaseSuccess } from "./purchasenew/success";
import { PurchasePending } from "./purchasenew/pending";
import { SelectWallet } from "./purchasenew/wallet/wallet";
import { CryptoCheckout } from "./purchasenew/checkout/crypto";
import { CollectibleListing } from "./inventory/collection/collectible-listing";
import { CollectiblePurchase } from "./inventory/collection/collectible-purchase";
import { Execute } from "./Execute";
import { Funding } from "./funding";
import { Deposit } from "./funding/Deposit";
import { useNavigation } from "@/context";
import { Purchase } from "./purchase";
import { PurchaseType } from "@/hooks/payments/crypto";

import { Mocked } from "./mocked";
import { constants } from "starknet";

export function App() {
  const { navigate } = useNavigation();
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route
          path="mocked"
          element={
            <Mocked
              title="Log in"
              setSearchParams={(p) => {
                p.set(
                  "address",
                  "0x0000000000000000000000000000000000000000000000000000000000000000",
                );
                p.set("chain_id", constants.StarknetChainId.SN_MAIN);
                p.set(
                  "rpc_url",
                  encodeURIComponent(
                    "https://api.cartridge.gg/x/starknet/mainnet",
                  ),
                );
              }}
            />
          }
        />
        <Route
          path="mocked/sign-message"
          element={
            <Mocked
              title="Sign message"
              setSearchParams={(p) => {
                const sig = [
                  "0x0000000000000000000000000000000000000000000000000000000000000000",
                  "0x0000000000000000000000000000000000000000000000000000000000000000",
                  "0x0000000000000000000000000000000000000000000000000000000000000000",
                ];
                for (const s of sig) {
                  p.append("signature", s);
                }
              }}
            />
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/recovery" element={<Recovery />} />
        <Route path="/settings/delegate" element={<Delegate />} />
        <Route path="/settings/add-signer" element={<AddSignerRoute />} />
        <Route path="session" element={<Session />} />
        <Route path="slot" element={<Slot />}>
          <Route path="consent" element={<Consent />} />
          <Route path="fund" element={<Fund />} />
        </Route>
        <Route path="success" element={<Success />} />
        <Route path="failure" element={<Failure />} />
        <Route path="pending" element={<Pending />} />
        <Route path="/purchase" element={<Outlet />}>
          <Route
            path="credits"
            element={<Purchase type={PurchaseType.CREDITS} />}
          />
          <Route
            path="starterpack/:starterpackId"
            element={<PurchaseStarterpack />}
          />
          <Route path="method" element={<PaymentMethod />} />
          <Route path="checkout/stripe" element={<StripeCheckout />} />
          <Route path="checkout/crypto" element={<CryptoCheckout />} />
          <Route path="wallet/:platformId" element={<SelectWallet />} />
          <Route path="review" element={<></>} />
          <Route path="pending" element={<PurchasePending />} />
          <Route path="success" element={<PurchaseSuccess />} />
          <Route path="failed" element={<></>} />
        </Route>
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
                if (returnTo) {
                  // returnTo is already decoded by URLSearchParams.get()
                  // Use replace navigation for execute URLs to ensure proper navigation stack handling
                  navigate(returnTo, { replace: true });
                } else {
                  navigate("/funding");
                }
              }}
            />
          }
        />
        <Route
          path="/funding/credits"
          element={
            <Purchase
              type={PurchaseType.CREDITS}
              // onBack={() => {
              //   const searchParams = new URLSearchParams(
              //     window.location.search,
              //   );
              //   const returnTo = searchParams.get("returnTo");
              //   if (returnTo) {
              //     // returnTo is already decoded by URLSearchParams.get()
              //     // Use replace navigation for execute URLs to ensure proper navigation stack handling
              //     navigate(returnTo, { replace: true });
              //   } else {
              //     navigate("/funding");
              //   }
              // }}
            />
          }
        />
        <Route path="/execute" element={<Execute />} />
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
          <Route
            path="inventory/collectible/:address/purchase"
            element={<CollectionPurchase />}
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
          <Route
            path="slot/:project/inventory/collectible/:address/purchase"
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
