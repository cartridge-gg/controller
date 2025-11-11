import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Confetti from "react-confetti";
import { BackgroundStars } from "./assets/background-stars";
import { ArcadeLogo } from "./assets/arcade-logo";
import { ArcadeIcon } from "./assets/arcade-icon";
import { generateColorShades } from "../../utils/color-utils";
import { computeRewards, createRewardCards } from "./utils";
import { RewardCard, RevealState } from "./types";

interface BoosterPackProps {
  starColor?: string;
}

export function BoosterPack({ starColor = "#DDD1FF" }: BoosterPackProps) {
  const { privateKey } = useParams<{ privateKey: string }>();
  const [showConfetti, setShowConfetti] = useState(false);
  const [numberOfPieces, setNumberOfPieces] = useState(500);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [rewardCards, setRewardCards] = useState<RewardCard[]>([]);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

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

  // Generate color shades from the star color
  const confettiColors = generateColorShades(starColor);

  // Handle claim button click - prefetch and reveal rewards
  const handleClaim = async () => {
    if (!privateKey || isClaimed || isRevealing) return;

    setIsClaimed(true);
    setIsRevealing(true);

    // Compute rewards immediately using the private key
    const rewards = computeRewards(privateKey, 3);
    const cards = createRewardCards(rewards);

    // Wait 2 seconds before showing cards and starting reveal
    setTimeout(() => {
      setRewardCards(cards);

      // Show confetti after cards appear
      setShowConfetti(true);
      setNumberOfPieces(500);

      // Stop generating new pieces after 3 seconds
      setTimeout(() => setNumberOfPieces(0), 3000);

      // Start revealing cards sequentially with delays
      cards.forEach((_, index) => {
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
          }, 600);
        }, index * 800); // Stagger each card by 800ms
      });

      // Stop confetti after all cards revealed
      setTimeout(
        () => {
          setShowConfetti(false);
          setIsRevealing(false);
        },
        cards.length * 800 + 2000,
      );
    }, 2000); // 2 second delay before revealing
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
          className="px-3 py-2 md:px-4 md:py-2.5 bg-[#161a17] border rounded text-xs md:text-sm font-medium uppercase tracking-wider hover:bg-[#1a1f1c] transition-colors"
          style={{ borderColor: starColor, color: starColor }}
        >
          CONNECT
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
                  {/* Card Back (unrevealed placeholder) */}
                  <div
                    className="absolute inset-0 rounded-lg overflow-hidden shadow-[0px_4px_16px_0px_#000000] flex items-center justify-center transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a1f1c 0%, #0f1410 100%)",
                      opacity:
                        card.revealState === RevealState.UNREVEALED ? 1 : 0,
                      pointerEvents:
                        card.revealState === RevealState.UNREVEALED
                          ? "auto"
                          : "none",
                    }}
                  ></div>

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
          // Placeholder before claim - Explainer image
          <div className="relative w-[200px] h-[272px] md:w-[280px] md:h-[380px] rounded-lg overflow-hidden shadow-[0px_4px_16px_0px_#000000]">
            <img
              src="/booster-pack/EXPLAINER.png"
              alt="Booster Pack Explainer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={isClaimed}
          className="px-6 py-3 rounded-3xl text-sm font-bold uppercase tracking-[2.1px] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isClaimed ? "#666" : starColor,
            color: "#0f1410",
          }}
        >
          {isClaimed ? (isRevealing ? "REVEALING..." : "CLAIMED") : "CLAIM"}
        </button>
      </div>
    </div>
  );
}
