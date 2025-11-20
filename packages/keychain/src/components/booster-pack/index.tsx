import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Confetti from "react-confetti";
import useEmblaCarousel from "embla-carousel-react";
import { BackgroundStars } from "./assets/background-stars";
import { ArcadeLogo } from "./assets/arcade-logo";
import { ArcadeIcon } from "./assets/arcade-icon";
import { generateColorShades } from "../../utils/color-utils";
import {
  checkAssetEligibility,
  signClaimMessage,
  claimBoosterCredits,
  ClaimCreditsMessage,
  deriveEthereumAddress,
  assetTokenImageUrl,
  assetGameTokenImageUrl,
} from "./utils";
import { RevealState, RewardType } from "./types";
import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import { CheckIcon } from "./assets/check";
import { useMerkleClaim } from "@/hooks/merkle-claim";
import { hash } from "starknet";

const STAR_COLOR = "#FBCB4A";

const CONFETTI_COLORS = generateColorShades(STAR_COLOR);

// Map asset types to game names for Play button
const ASSET_TO_GAME_MAP: Record<string, { name: string; url: string }> = {
  CREDITS: {
    name: "CHECK ARCADE",
    url: "https://play.cartridge.gg/game/loot-survivor/tab/about",
  },
  SURVIVOR: { name: "PLAY LOOT SURVIVOR", url: "https://lootsurvivor.io" },
  LORDS: { name: "PLAY REALMS", url: "https://realms.world" },
  NUMS: { name: "PLAY NUMS", url: "https://nums.gg" },
  PAPER: { name: "PLAY DOPE WARS", url: "https://dopewars.game" },
  MYSTERY_ASSET: {
    name: "PLAY LOOT SURVIVOR",
    url: "https://play.cartridge.gg/game/loot-survivor/tab/about",
  },
};

// Map mystery asset card reward types to their specific game URLs
const MYSTERY_CARD_GAME_MAP: Partial<Record<RewardType, string>> = {
  // Mystery asset cards
  [RewardType.LS2_GAME]:
    "https://tournaments.lootsurvivor.io/survivor/play?id=",
  [RewardType.NUMS_GAME]: "https://www.nums.gg/",
};

export function BoosterPack() {
  const { privateKey } = useParams<{ privateKey: string }>();
  const account = useAccount();
  const { controller } = useConnection();

  // Embla carousel - responsive configuration
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    // Disable dragging on desktop, allow multiple slides visible
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [numberOfPieces, setNumberOfPieces] = useState(500);
  const [username, setUsername] = useState<string | null>(null);
  const [rewardCards, setRewardCards] = useState<
    {
      type: RewardType;
      name: string;
      image: string;
      revealState: RevealState;
      tokenId?: string;
    }[]
  >([]);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetInfo, setAssetInfo] = useState<{
    type: string;
    value: number;
  } | null>(null);
  const [isCheckingAsset, setIsCheckingAsset] = useState(true);
  const [assetCardImage, setAssetCardImage] = useState<string | null>(null);

  useEffect(() => {
    if (controller) {
      setUsername(controller.username());
    }
  }, [controller]);

  // Track carousel slide changes
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // Set initial selected index

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const ethereumAddress = useMemo(() => {
    if (!privateKey) {
      return;
    }

    try {
      return deriveEthereumAddress(privateKey);
    } catch (error) {
      console.error("Error deriving Ethereum address:", error);
      return undefined;
    }
  }, [privateKey]);

  const keys = [
    "booster-pack-nums-mainnet",
    "booster-pack-credits-mainnet",
    "booster-pack-lords-mainnet",
    "booster-pack-mystery-mainnet",
    "booster-pack-paper-mainnet",
    "booster-pack-survivor-mainnet",
  ].join(";");

  const {
    claims,
    isLoading: isLoadingClaims,
    onSendClaim,
  } = useMerkleClaim({
    keys,
    type: "preimage",
    address: ethereumAddress,
    preimage: privateKey,
  });

  useEffect(() => {
    if (isLoadingClaims) {
      return;
    }

    if (claims.length === 0) {
      setError("No claims found");
      return;
    }

    setIsClaimed(claims.every((claim) => claim.claimed));
  }, [claims, isLoadingClaims]);

  // Check localStorage FIRST on mount - immediate source of truth
  useEffect(() => {
    if (!ethereumAddress) {
      return;
    }

    try {
      const stored = localStorage.getItem(`booster-pack-${ethereumAddress}`);
      if (!stored) {
        return; // No stored data, proceed with normal flow
      }

      const data = JSON.parse(stored);

      // Immediately restore state - this runs before async operations complete
      setRewardCards(
        data.rewardCards.map(
          (card: {
            type: RewardType;
            name: string;
            image: string;
            tokenId?: string;
          }) => ({
            ...card,
            revealState: RevealState.REVEALED,
          }),
        ),
      );

      // Set claimed status immediately
      setIsClaimed(true);
    } catch (err) {
      console.error("Failed to restore claim data from localStorage:", err);
    }
  }, [ethereumAddress]); // Only depends on address - runs once when available

  // Check asset eligibility on first load
  useEffect(() => {
    const checkAsset = async () => {
      if (!privateKey || !ethereumAddress) {
        setError("No private key provided");
        setIsCheckingAsset(false);
        return;
      }

      try {
        setIsCheckingAsset(true);
        setError(null);

        // Check asset eligibility
        const asset = await checkAssetEligibility(ethereumAddress);

        setAssetInfo(asset);

        // Determine the card image based on asset type
        setAssetCardImage(assetTokenImageUrl(asset.type));
        setIsCheckingAsset(false);
      } catch (err) {
        console.error("Asset check error:", err);
        setIsCheckingAsset(false);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to check asset";

        if (errorMessage.includes("not found")) {
          setError("This address is not eligible for a booster pack");
        } else {
          setError("Failed to check asset eligibility");
        }
      }
    };

    checkAsset();
  }, [privateKey, ethereumAddress]);

  // Handle claim button click - connects if needed, then claims
  const handleClaim = async () => {
    // Check if user is logged in
    if (!username || !account) {
      // Not connected - trigger connection flow
      const currentUrl = window.location.href;
      window.location.href = `/connect?redirect_url=${encodeURIComponent(currentUrl)}&preset=booster-pack-devconnect`;
      return;
    }

    if (
      !privateKey ||
      !assetInfo ||
      isClaimed ||
      isRevealing ||
      isLoading ||
      isLoadingClaims ||
      !controller
    )
      return;

    setIsLoading(true);
    setError(null);

    try {
      // Only call claim_credits API if asset type is "credits"
      if (assetInfo.type.toLowerCase() === "credits") {
        // Create claim message
        const message: ClaimCreditsMessage = {
          account_username: account.username,
          amount: `0x${assetInfo.value.toString(16)}`, // Convert to hex
        };

        // Sign the message
        const signature = await signClaimMessage(privateKey, message);

        // Call claim API (backend recovers signer address from signature)
        await claimBoosterCredits({
          account_username: account.username,
          message,
          signature,
        });
      }

      const txnHash = await onSendClaim();
      const receipt = await controller.provider.waitForTransaction(txnHash, {
        retryInterval: 1000,
      });

      if (receipt.isError()) {
        setError("Transaction Failed: " + receipt.value.message);
        setIsLoading(false);
        setIsClaimed(false);
        setIsRevealing(false);
        return;
      }

      // Success! Mark as claimed
      setIsClaimed(true);
      setIsLoading(false);

      // Only show animation for mystery_asset type
      if (
        assetInfo &&
        (assetInfo.type.toLowerCase() === "mystery" ||
          assetInfo.type.toLowerCase() === "mystery_asset")
      ) {
        setIsRevealing(true);

        let ls2TokenId;
        let numsTokenId;
        receipt.events.forEach((event) => {
          if (
            event.keys[0] ===
            hash.getSelectorFromName("TournamentTicketsClaimed")
          ) {
            ls2TokenId = parseInt(event.data[2]);
            numsTokenId = parseInt(event.data[3]);
          }
        });

        if (ls2TokenId === undefined || numsTokenId === undefined) {
          setError("Failed to determine token IDs. Transaction: " + txnHash);
          setIsLoading(false);
          setIsRevealing(false);
          return;
        }

        // Create specific cards for mystery asset reveal
        const mysteryCards = [
          {
            type: RewardType.LS2_GAME,
            name: "Loot Survivor 2 Game Pass",
            image: assetGameTokenImageUrl(RewardType.LS2_GAME),
            revealState: RevealState.UNREVEALED,
            tokenId: ls2TokenId,
          },
          {
            type: RewardType.NUMS_GAME,
            name: "NUMS Game Pass",
            image: assetGameTokenImageUrl(RewardType.NUMS_GAME),
            revealState: RevealState.UNREVEALED,
            tokenId: numsTokenId,
          },
        ];

        // Store revealed card data in localStorage for persistence across navigation
        try {
          localStorage.setItem(
            `booster-pack-${ethereumAddress}`,
            JSON.stringify({
              rewardCards: mysteryCards.map((card) => ({
                type: card.type,
                name: card.name,
                image: card.image,
                tokenId: card.tokenId,
              })),
              ls2TokenId,
              numsTokenId,
            }),
          );
        } catch (err) {
          console.error("Failed to store claim data in localStorage:", err);
        }

        // Wait 2 seconds before showing cards and starting reveal
        setTimeout(() => {
          setRewardCards(mysteryCards);

          // Show confetti after cards appear
          setShowConfetti(true);
          setNumberOfPieces(500);

          // Stop generating new pieces after 3 seconds
          setTimeout(() => setNumberOfPieces(0), 3000);

          // Start revealing cards sequentially with delays
          mysteryCards.forEach((_, index) => {
            setTimeout(() => {
              setRewardCards((prevCards) =>
                prevCards.map((card, i) =>
                  i === index
                    ? { ...card, revealState: RevealState.REVEALING }
                    : card,
                ),
              );

              // Complete reveal after flip animation
              setTimeout(() => {
                setRewardCards((prevCards) =>
                  prevCards.map((card, i) =>
                    i === index
                      ? { ...card, revealState: RevealState.REVEALED }
                      : card,
                  ),
                );
              }, 500);
            }, index * 500); // Stagger each card by 500ms
          });

          // Stop confetti after all cards revealed
          setTimeout(
            () => {
              setShowConfetti(false);
              setIsRevealing(false);
            },
            mysteryCards.length * 800 + 2000,
          );
        }, 2000); // 2 second delay before revealing
      }
    } catch (err) {
      console.error("Claim error:", err);
      setIsLoading(false);
      setIsClaimed(false);
      setIsRevealing(false);

      // Parse error message
      const errorMessage =
        err instanceof Error ? err.message : "Failed to claim rewards";

      if (errorMessage.includes("already claimed")) {
        setError("This booster pack has already been claimed");
      } else if (errorMessage.includes("not eligible")) {
        setError("This address is not eligible for a booster pack");
      } else if (errorMessage.includes("Account not found")) {
        setError("Account not found. Please try again");
      } else {
        setError("Failed to claim rewards. Please try again");
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-dvh h-full bg-[#0f1410] sm:overflow-hidden font-ld">
      {/* Confetti */}
      <div className="z-50">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            colors={CONFETTI_COLORS}
            numberOfPieces={numberOfPieces}
            recycle={false}
            gravity={0.3}
            tweenDuration={3000}
          />
        )}
      </div>

      {/* Background Gradient with Stars */}
      <div className="absolute inset-0 w-full h-full">
        <BackgroundStars
          starColor={STAR_COLOR}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-auto object-contain pointer-events-none"
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between w-full px-4 py-4 md:px-6 md:py-6 z-20 bg-[#0F1410]">
        {/* Arcade Logo */}
        <button className="flex items-center gap-2 shrink-0 relative">
          <div className="w-6 h-6 md:w-8 md:h-8">
            <ArcadeIcon color={STAR_COLOR} />
          </div>
          <div className="h-5 md:h-6 w-auto" style={{ width: "87px" }}>
            <ArcadeLogo color={STAR_COLOR} />
          </div>
        </button>

        {/* Display username if connected */}
        {account?.username && (
          <div
            className="px-3 py-2 md:px-4 md:py-2.5 bg-[#161a17] border rounded text-xs md:text-sm font-medium uppercase tracking-wider"
            style={{ borderColor: STAR_COLOR, color: STAR_COLOR }}
          >
            {account.username}
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-start sm:justify-center gap-8 md:gap-12 px-4 pb-20 md:pb-24 md:pt-8 w-full">
        {/* Header Text */}
        <div className="backdrop-blur-sm bg-[rgba(0,0,0,0.48)] px-4 py-2 rounded-lg">
          <h1 className="text-white text-xl md:text-2xl font-normal">
            {isClaimed ? "Your Rewards" : "Booster Pack"}
          </h1>
        </div>

        {/* Cards Display */}
        {rewardCards.length > 0 ? (
          <div className="w-full max-w-5xl" ref={emblaRef}>
            <div className="flex gap-4 md:gap-12 pb-12 sm:pb-0 md:justify-center">
              {/* Mobile padding */}
              <div className="md:hidden px-4"></div>

              {rewardCards.map((card, index) => {
                const gameUrl = MYSTERY_CARD_GAME_MAP[card.type];
                const isClickable = isClaimed && !isRevealing;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isClickable || !gameUrl) return;

                      // If already selected, open the game
                      if (isSelected) {
                        const fullUrl = card.tokenId
                          ? `${gameUrl}${card.tokenId}`
                          : gameUrl;
                        window.open(fullUrl, "_blank");
                      } else {
                        // Otherwise, select the card
                        if (emblaApi) {
                          emblaApi.scrollTo(index);
                        }
                        setSelectedIndex(index);
                      }
                    }}
                    disabled={!isClickable || !gameUrl}
                    className={`relative flex-[0_0_70%] md:flex-none md:w-[220px] min-w-0 transition-transform duration-300 ease-out ${
                      isClickable && gameUrl
                        ? "cursor-pointer"
                        : "cursor-default"
                    } ${isSelected ? "scale-100" : "scale-90 md:scale-100"}`}
                    aria-label={isClickable ? `Select ${card.name}` : card.name}
                  >
                    {/* Card container with fade-up animation */}
                    <div className="relative w-full aspect-[180/245] md:h-[300px] md:aspect-auto">
                      {/* Card Front (revealed with fade-up) */}
                      <div
                        className={`absolute inset-0 rounded-lg overflow-hidden flex flex-col transition-all duration-300 ease-out ${
                          isSelected
                            ? "shadow-[0px_12px_32px_0px_rgba(251,203,74,0.3)]"
                            : "shadow-[0px_8px_24px_0px_#000000]"
                        }`}
                        style={{
                          opacity:
                            card.revealState === RevealState.UNREVEALED ? 0 : 1,
                          transform:
                            card.revealState === RevealState.UNREVEALED
                              ? "translateY(20px)"
                              : "translateY(0)",
                        }}
                      >
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Mobile padding */}
              <div className="md:hidden px-4"></div>
            </div>
          </div>
        ) : (
          // Placeholder before claim - Show asset card or loading
          <div className="relative w-[280px] h-[380px] md:w-[280px] md:h-[380px] rounded-lg overflow-hidden shadow-[0px_4px_16px_0px_#000000]">
            {isCheckingAsset ? (
              <div className="w-full h-full flex items-center justify-center bg-[#161a17]">
                <p className="text-white text-sm">Loading...</p>
              </div>
            ) : assetCardImage ? (
              <>
                <img
                  src={assetCardImage}
                  alt={`${assetInfo?.type} asset`}
                  className="w-full h-full object-cover"
                />
                {/* Claimed Overlay */}
                {isClaimed && !isRevealing && (
                  <div className="absolute inset-0 bg-[#00000060] flex flex-col items-center justify-center gap-3">
                    <div className=" flex h-full w-full relative">
                      <p className=" absolute left-1/2 -translate-x-1/2 text-white text-xl md:text-xl font-semibold uppercase tracking-wider bg-[#000] p-4 rounded-lg">
                        CLAIMED
                      </p>
                    </div>
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-sm bg-[#000]/80 flex items-center justify-center absolute">
                      <CheckIcon color={STAR_COLOR} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={assetTokenImageUrl(RewardType.EXPLAINER)}
                alt={RewardType.EXPLAINER}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-1 md:gap-4 items-center justify-center pb-6 pt-2 sm:pb-16 fixed bottom-0 left-0 right-0 bg-[#0F1410] sm:bg-transparent">
          {/* Error Message */}
          {error ? (
            <div className="backdrop-blur-sm bg-red-900/80 px-4 py-3 rounded-lg max-w-md text-center text-xs">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          ) : null}

          <div>
            {isClaimed && !isRevealing && controller ? (
              // Show Play and Inventory buttons after successful claim
              <div className="flex flex-row gap-3 md:gap-4 items-center w-full sm:w-auto px-4">
                {/* Primary CTA - Play Game Button */}
                <button
                  onClick={() => {
                    const isMystery =
                      assetInfo?.type.toUpperCase() === "MYSTERY" ||
                      assetInfo?.type.toUpperCase() === "MYSTERY_ASSET";

                    if (isMystery && rewardCards.length > 0) {
                      // On mobile, use the currently selected card from carousel
                      const selectedCard = rewardCards[selectedIndex];
                      const gameUrl = MYSTERY_CARD_GAME_MAP[selectedCard.type];

                      if (gameUrl && selectedCard.tokenId) {
                        const fullUrl = `${gameUrl}${selectedCard.tokenId}`;
                        window.open(fullUrl, "_blank");
                      }
                    } else {
                      const gameInfo =
                        ASSET_TO_GAME_MAP[assetInfo?.type.toUpperCase() || ""];
                      if (gameInfo?.url) {
                        window.open(gameInfo.url, "_blank");
                      }
                    }
                  }}
                  className="px-8 py-3 w-full rounded-3xl text-xs sm:text-sm font-bold uppercase tracking-[2.1px] transition-all shadow-lg hover:opacity-90"
                  style={{
                    backgroundColor: STAR_COLOR,
                    color: "#0f1410",
                  }}
                >
                  {(() => {
                    const isMystery =
                      assetInfo?.type.toUpperCase() === "MYSTERY" ||
                      assetInfo?.type.toUpperCase() === "MYSTERY_ASSET";

                    if (isMystery && rewardCards.length > 0) {
                      const selectedCard = rewardCards[selectedIndex];
                      return selectedCard.type === RewardType.LS2_GAME
                        ? "PLAY LOOT SURVIVOR 2"
                        : "PLAY NUMS";
                    }

                    return (
                      ASSET_TO_GAME_MAP[assetInfo?.type.toUpperCase() || ""]
                        ?.name || "PLAY GAME"
                    );
                  })()}
                </button>
              </div>
            ) : (
              // Show Claim button before claiming
              <button
                onClick={handleClaim}
                disabled={isClaimed || isLoading || isLoadingClaims}
                className="px-6 py-3 rounded-3xl text-sm font-bold uppercase tracking-[2.1px] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isClaimed || isLoading ? "#666" : STAR_COLOR,
                  color: "#0f1410",
                }}
              >
                {isCheckingAsset || isLoadingClaims
                  ? "CHECKING..."
                  : isLoading
                    ? "CLAIMING..."
                    : isClaimed
                      ? isRevealing
                        ? "REVEALING..."
                        : "CLAIMED"
                      : !username || !account
                        ? "CONNECT"
                        : "CLAIM"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
