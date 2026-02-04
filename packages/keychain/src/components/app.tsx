import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Auth } from "./slot/index";
import { AuthOptions } from "@cartridge/controller";
import { Session } from "./session";
import { Failure } from "./failure";
import { Pending } from "./pending";
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
import { Settings } from "./settings";
import { Recovery } from "./settings/Recovery";
import { Delegate } from "./settings/Delegate";
import { AddSignerRoute } from "./settings/AddSignerRoute";
import { AddConnectionRoute } from "./settings/AddConnectionRoute";
import { PaymentMethod } from "./purchasenew/method";
import { Verification } from "./purchasenew/verification";
import { StripeCheckout } from "./purchasenew/checkout/stripe";
import { Success as PurchaseSuccess } from "./purchasenew/success";
import { Pending as PurchasePending } from "./purchasenew/pending";
import { SelectWallet } from "./purchasenew/wallet/wallet";
import { CollectibleListing } from "./inventory/collection/collectible-listing";
import { CollectiblePurchase } from "./inventory/collection/collectible-purchase";
import { Execute } from "./Execute";
import { SignMessage } from "./SignMessage";
import { ConnectRoute } from "./ConnectRoute";
import { Funding } from "./funding";
import { Deposit } from "./funding/Deposit";
import { useNavigation } from "@/context";
import { Purchase } from "./purchase";
import { PurchaseType } from "@cartridge/ui/utils/api/cartridge";
import { ChooseNetwork } from "./purchasenew/wallet/network";
import { Claim } from "./purchasenew/claim/claim";
import { Collections } from "./purchasenew/starterpack/collections";
import { DeployController } from "./DeployController";
import { useConnection } from "@/hooks/connection";
import { CreateController, Upgrade } from "./connect";
import { useUpgrade } from "./provider/upgrade";
import { Layout } from "@/components/layout";
import { Authenticate } from "./authenticate";
import { Disconnect } from "./disconnect";
import { StarterpackProviders } from "@/context";
import { OnchainCheckout } from "./purchasenew/checkout/onchain";
import { CoinbaseCheckout } from "./purchasenew/checkout/coinbase";
import { useAccount } from "@/hooks/account";
import { BoosterPack } from "./booster-pack";
import { useEffect } from "react";
import { StandaloneSessionCreation } from "./connect/StandaloneSessionCreation";
import { StandaloneConnect } from "./connect/StandaloneConnect";
import { hasApprovalPolicies } from "@/hooks/session";
import { PurchaseStarterpack } from "./purchasenew/starterpack/starterpack";
import { Quests } from "./quests";
import { QuestClaim } from "./quests/claim";

function DefaultRoute() {
  const account = useAccount();
  const { search } = useLocation();
  const { navigate } = useNavigation();

  // Check if we have a redirect_url parameter
  const searchParams = new URLSearchParams(search);
  const redirectUrl = searchParams.get("redirect_url");

  // Use useEffect to handle navigation to avoid updating state during render
  useEffect(() => {
    // If redirect_url is present, route to connect component
    if (redirectUrl) {
      navigate(`/connect${search}`, { replace: true });
      return;
    }

    // When logged in and at root path, redirect to inventory
    // Preserve all URL parameters during redirect
    if (account?.username) {
      navigate(`/account/${account.username}/inventory`, {
        reset: true,
      });
    }
  }, [redirectUrl, account?.username, navigate, search]);

  // If no account, render nothing (Authentication component will handle login)
  return null;
}

function Authentication() {
  const { controller, isConfigLoading, policies, verified } = useConnection();
  const { pathname, search } = useLocation();

  const upgrade = useUpgrade();

  // Check if session creation is needed (returning from standalone auth flow)
  const searchParams = new URLSearchParams(search);
  const needsSessionCreation =
    searchParams.get("needs_session_creation") === "true";
  const username = searchParams.get("username") ?? undefined;
  const preset = searchParams.get("preset");

  // If session creation is needed (returning from standalone auth)
  if (needsSessionCreation) {
    // Show loading while config is loading
    if (preset && isConfigLoading) {
      return (
        <CreateController
          isSlot={pathname.startsWith("/slot")}
          isLoading={true}
        />
      );
    }

    // Decide which UI to show based on verification status and policies
    const hasManualPolicies = policies?.contracts || policies?.messages;
    const shouldShowSessionConsent =
      !verified || hasManualPolicies || hasApprovalPolicies(policies);

    if (shouldShowSessionConsent) {
      // Show session creation consent UI for unverified presets or custom policies
      return <StandaloneSessionCreation username={username} />;
    } else {
      // Show simple standalone connect UI for verified presets with no custom policies
      return <StandaloneConnect username={username} />;
    }
  }

  // Popup flow authentication
  if (pathname.startsWith("/authenticate")) {
    return <Authenticate />;
  }

  if (pathname.startsWith("/disconnect")) {
    return <Disconnect />;
  }

  // No controller, show CreateController
  if (!controller) {
    // Extract signers from URL if present (for connect flow)
    const searchParams = new URLSearchParams(search);
    const signersParam = searchParams.get("signers");
    let signers: AuthOptions | undefined;

    if (signersParam) {
      try {
        signers = JSON.parse(decodeURIComponent(signersParam)) as AuthOptions;
      } catch (error) {
        console.error("Failed to parse signers parameter:", error);
        // Continue with undefined signers on parse error
      }
    }

    return (
      <CreateController
        isSlot={pathname.startsWith("/slot")}
        signers={signers}
      />
    );
  }

  // Controller exists but upgrade not synced - show CreateController with loading instead of PageLoading
  if (!upgrade.isSynced || isConfigLoading) {
    return (
      <CreateController
        isSlot={pathname.startsWith("/slot")}
        isLoading={true}
      />
    );
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function App() {
  const { navigate } = useNavigation();

  return (
    <Routes>
      <Route path="/booster-pack/:privateKey" element={<BoosterPack />} />
      <Route path="/" element={<Authentication />}>
        <Route index element={<DefaultRoute />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/recovery" element={<Recovery />} />
        <Route path="/settings/delegate" element={<Delegate />} />
        <Route path="/settings/add-signer" element={<AddSignerRoute />} />
        <Route
          path="/settings/add-connection"
          element={<AddConnectionRoute />}
        />
        <Route path="session" element={<Session />} />
        <Route path="slot" element={<Outlet />}>
          <Route index element={<Auth />} />
          <Route path="consent" element={<Consent />} />
          <Route path="fund" element={<Fund />} />
        </Route>
        <Route path="success" element={<Success />} />
        <Route path="failure" element={<Failure />} />
        <Route path="pending" element={<Pending />} />
        <Route
          path="/purchase"
          element={
            <StarterpackProviders>
              <Outlet />
            </StarterpackProviders>
          }
        >
          <Route
            path="credits"
            element={<Purchase type={PurchaseType.Credits} />}
          />
          <Route
            path="starterpack/:starterpackId"
            element={<PurchaseStarterpack />}
          />
          <Route path="starterpack/collections" element={<Collections />} />
          <Route path="claim/:keys/:address/:type" element={<Claim />} />
          <Route path="method/:platforms" element={<PaymentMethod />} />
          <Route path="network/:platforms" element={<ChooseNetwork />} />
          <Route path="wallet/:platforms" element={<SelectWallet />} />
          <Route path="verification" element={<Verification />} />
          <Route path="checkout/stripe" element={<StripeCheckout />} />
          <Route path="checkout/onchain" element={<OnchainCheckout />} />
          <Route path="checkout/coinbase" element={<CoinbaseCheckout />} />
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
              type={PurchaseType.Credits}
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
        <Route path="/sign-message" element={<SignMessage />} />
        <Route path="/deploy" element={<DeployController />} />
        <Route path="/connect" element={<ConnectRoute />} />
        <Route path="/feature/:name/:action" element={<FeatureToggle />} />
        <Route path="account/:username" element={<Account />}>
          <Route path="inventory" element={<Inventory />} />
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
          <Route path="quests" element={<Quests />} />
          <Route path="quests/:id/claim" element={<QuestClaim />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="trophies" element={<RedirectAchievements />} />

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
          <Route path="slot/:project/quests" element={<Quests />} />
          <Route
            path="slot/:project/quests/:id/claim"
            element={<QuestClaim />}
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
