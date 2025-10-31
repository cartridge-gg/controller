import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Confetti from "react-confetti";
import { BackgroundStars } from "./assets/background-stars";
import { ArcadeLogo } from "./assets/arcade-logo";
import { ArcadeIcon } from "./assets/arcade-icon";
import { generateColorShades } from "../../utils/color-utils";

interface BoosterPackProps {
  starColor?: string;
}

export function BoosterPack({ starColor = "#DDD1FF" }: BoosterPackProps) {
  const { privateKey } = useParams<{ privateKey: string }>();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Log the private key for debugging (will be used for computations later)
  console.log("Private Key:", privateKey);

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

  // Handle claim button click
  const handleClaim = () => {
    setShowConfetti(true);
    // Stop confetti after 5 seconds
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-[#0f1410] overflow-hidden font-ld">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          colors={confettiColors}
          numberOfPieces={500}
          recycle={false}
          gravity={0.3}
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
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 md:gap-16 px-4 py-20 md:pb-24 md:pt-8 w-full">
        {/* Card Label */}
        <div className="backdrop-blur-sm bg-[rgba(0,0,0,0.48)] px-4 py-2 rounded-lg">
          <h1 className="text-white text-xl md:text-2xl font-normal">
            NUMS Card
          </h1>
        </div>

        {/* Card Image */}
        <div className="relative w-[200px] h-[272px] md:w-[240px] md:h-[326px] rounded-lg overflow-hidden shadow-[0px_4px_16px_0px_#000000]">
          <img
            src="/booster-pack/card-nums.png"
            alt="NUMS Card"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          className="px-6 py-3 bg-[#ddd1ff] rounded-3xl text-[#0f1410] text-sm font-bold uppercase tracking-[2.1px] hover:bg-[#e8e0ff] transition-colors shadow-lg"
        >
          CLAIM
        </button>
      </div>
    </div>
  );
}
