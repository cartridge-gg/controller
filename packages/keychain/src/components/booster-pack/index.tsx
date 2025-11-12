import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Confetti from "react-confetti";
import { BackgroundStars } from "./assets/background-stars";
import { ArcadeLogo } from "./assets/arcade-logo";
import { ArcadeIcon } from "./assets/arcade-icon";
import { generateColorShades } from "../../utils/color-utils";
import {
  deriveEthereumAddress,
  checkAssetEligibility,
  signClaimMessage,
  claimBoosterCredits,
  ClaimCreditsMessage,
} from "./utils";
import { RewardCard, RevealState, RewardType } from "./types";
// import { useAccount } from "../../hooks/account";

interface BoosterPackProps {
  starColor?: string;
}

export function BoosterPack({ starColor = "#DDD1FF" }: BoosterPackProps) {
  const { privateKey } = useParams<{ privateKey: string }>();
  // const account = useAccount();

  // MOCK DATA FOR TESTING - Remove when connect is ready
  const account = {
    address:
      "0x01697eB1512f6567a58cB35268b87cA172Ee2A4b53b1A1A310fC52f16C9AE633",
    username: "testuser",
  };

  const [showConfetti, setShowConfetti] = useState(false);
  const [numberOfPieces, setNumberOfPieces] = useState(500);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [rewardCards, setRewardCards] = useState<RewardCard[]>([]);
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

  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check asset eligibility on first load
  useEffect(() => {
    const checkAsset = async () => {
      if (!privateKey) {
        setError("No private key provided");
        setIsCheckingAsset(false);
        return;
      }

      try {
        setIsCheckingAsset(true);
        setError(null);

        // Derive Ethereum address from private key
        const ethereumAddress = deriveEthereumAddress(privateKey);

        // Check asset eligibility
        const asset = await checkAssetEligibility(ethereumAddress);

        setAssetInfo(asset);

        // Determine the card image based on asset type
        const assetType = asset.type.toUpperCase();
        const assetValue = asset.value;

        // Map asset type to image path
        let imagePath = "/booster-pack/EXPLAINER.png"; // default

        if (assetType === "CREDITS") {
          imagePath = `/booster-pack/CREDITS_${assetValue * 10 ** 18}.png`;
        } else if (assetType === "MYSTERY_ASSET") {
          imagePath = "/booster-pack/MYSTERY_ASSET.png";
        } else if (assetType === "SURVIVOR") {
          imagePath = `/booster-pack/SURVIVOR_${assetValue * 10 ** 18}.png`;
        } else if (assetType === "LORDS") {
          imagePath = `/booster-pack/LORDS_${assetValue * 10 ** 18}.png`;
        } else if (assetType === "NUMS") {
          imagePath = `/booster-pack/NUMS_${assetValue * 10 ** 18}.png`;
        } else if (assetType === "PAPER") {
          imagePath = `/booster-pack/PAPER_${assetValue * 10 ** 18}.png`;
        }

        setAssetCardImage(imagePath);
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
  }, [privateKey]);

  // Generate color shades from the star color
  const confettiColors = generateColorShades(starColor);

  // Handle connect button click - disabled for testing
  const handleConnect = () => {
    // TODO: Implement connect flow when ready
    console.log("Connect clicked - using mock account for now");
  };

  // Handle claim button click - call API and reveal rewards
  const handleClaim = async () => {
    if (!privateKey || !assetInfo || isClaimed || isRevealing || isLoading)
      return;

    // Check if user is logged in
    if (!account?.username) {
      setError("Please connect your account to claim rewards");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Derive Ethereum address from private key
      const ethereumAddress = deriveEthereumAddress(privateKey);

      // Only call claim_credits API if asset type is "credits"
      if (assetInfo.type.toLowerCase() === "credits") {
        // Create claim message
        const message: ClaimCreditsMessage = {
          account_username: account.username,
          amount: `0x${assetInfo.value.toString(16)}`, // Convert to hex
        };

        // Sign the message
        const signature = await signClaimMessage(privateKey, message);

        // Call claim API
        await claimBoosterCredits({
          account_username: account.username,
          message,
          signature,
          signer_address: ethereumAddress,
        });
      }

      // Success! Mark as claimed
      setIsClaimed(true);
      setIsLoading(false);

      // Only show animation for mystery_asset type
      if (assetInfo.type.toLowerCase() === "mystery_asset") {
        setIsRevealing(true);

        // Create specific cards for mystery asset reveal
        const mysteryCards: RewardCard[] = [
          {
            type: RewardType.LS2_GAME,
            name: "LS2 Game Pass",
            image: "/booster-pack/LS2_GAME.png",
            rarity: "epic",
            revealState: RevealState.UNREVEALED,
          },
          {
            type: RewardType.NUMS_GAME,
            name: "NUMS Game Pass",
            image: "/booster-pack/NUMS_GAME.png",
            rarity: "epic",
            revealState: RevealState.UNREVEALED,
          },
          {
            type: RewardType.REALM,
            name: "Realm NFT",
            image: "/booster-pack/REALM_1.png",
            rarity: "epic",
            revealState: RevealState.UNREVEALED,
          },
        ];

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
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-[#0f1410] overflow-hidden font-ld">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          colors={confettiColors}
          numberOfPieces={numberOfPieces}
          recycle={false}
          gravity={0.3}
          tweenDuration={3000}
        />
      )}

      {/* Background Gradient with Stars */}
      <div className="absolute inset-0 w-full h-full">
        <BackgroundStars
          starColor={starColor}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1512px] h-auto object-contain pointer-events-none"
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between w-full px-4 py-4 md:px-6 md:py-6 z-20">
        {/* Arcade Logo */}
        <button className="flex items-center gap-2 shrink-0 relative">
          <div className="w-6 h-6 md:w-8 md:h-8">
            <ArcadeIcon color={starColor} />
          </div>
          <div className="h-5 md:h-6 w-auto" style={{ width: "87px" }}>
            <ArcadeLogo color={starColor} />
          </div>
        </button>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          className="px-3 py-2 md:px-4 md:py-2.5 bg-[#161a17] border rounded text-xs md:text-sm font-medium uppercase tracking-wider hover:bg-[#1a1f1c] transition-colors disabled:opacity-50 disabled:cursor-default"
          style={{ borderColor: starColor, color: starColor }}
          disabled={!!account?.username}
        >
          {account?.username || "CONNECT"}
        </button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 md:gap-12 px-4 py-20 md:pb-24 md:pt-8 w-full">
        {/* Header Text */}
        <div className="backdrop-blur-sm bg-[rgba(0,0,0,0.48)] px-4 py-2 rounded-lg">
          <h1 className="text-white text-xl md:text-2xl font-normal">
            {isClaimed ? "Your Rewards" : "Booster Pack"}
          </h1>
        </div>

        {/* Cards Display */}
        {rewardCards.length > 0 ? (
          <div className="flex gap-4 md:gap-8 flex-wrap justify-center max-w-4xl">
            {rewardCards.map((card, index) => (
              <div
                key={index}
                className="relative w-[180px] h-[245px] md:w-[220px] md:h-[300px]"
              >
                {/* Card container with fade-up animation */}
                <div className="relative w-full h-full">
                  {/* Card Front (revealed with fade-up) */}
                  <div
                    className="absolute inset-0 rounded-lg overflow-hidden shadow-[0px_8px_24px_0px_#000000] flex flex-col transition-all duration-600 ease-out"
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
                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                      <p className="text-white text-sm font-medium text-center">
                        {card.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Placeholder before claim - Show asset card or loading
          <div className="relative w-[200px] h-[272px] md:w-[280px] md:h-[380px] rounded-lg overflow-hidden shadow-[0px_4px_16px_0px_#000000]">
            {isCheckingAsset ? (
              <div className="w-full h-full flex items-center justify-center bg-[#161a17]">
                <p className="text-white text-sm">Loading...</p>
              </div>
            ) : assetCardImage ? (
              <img
                src={assetCardImage}
                alt={`${assetInfo?.type} asset`}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/booster-pack/EXPLAINER.png"
                alt="Booster Pack Explainer"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="backdrop-blur-sm bg-red-900/80 px-4 py-3 rounded-lg max-w-md text-center">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={isClaimed || isLoading || isCheckingAsset || !assetInfo}
          className="px-6 py-3 rounded-3xl text-sm font-bold uppercase tracking-[2.1px] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              isClaimed || isLoading || isCheckingAsset || !assetInfo
                ? "#666"
                : starColor,
            color: "#0f1410",
          }}
        >
          {isCheckingAsset
            ? "CHECKING..."
            : isLoading
              ? "CLAIMING..."
              : isClaimed
                ? isRevealing
                  ? "REVEALING..."
                  : "CLAIMED"
                : "CLAIM"}
        </button>
      </div>
    </div>
  );
}
