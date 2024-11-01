import Controller from "../public/controller.svg?react";
import Slot from "../public/slot.svg?react";
import Sensei from "../public/sensei.png";

import { Link } from "react-router-dom";

const cardContent = [
  {
    title: "Play with",
    icon: <Controller alt="Controller" height={34} />,
    link: "/controller/overview",
    description:
      "Providing seamless player onboarding with self-custodial embedded wallets with Passkeys, Session Tokens, Paymaster and more. Start playing games in seconds!",
  },
  {
    title: "Scale with",
    icon: <Slot alt="Slot" height={34} />,
    link: "/slot/getting-started",
    description:
      "Horizontally scalable execution sharding for ephemeral and persistent rollups. Providing low latency execution contexts with fixed costs.",
  },
];

export function HomePage() {
  return (
    <div className="">
      <div className="border-y border-white/20 py-20 border-[#252525] bg-[#1e1e1e]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row gap-8 sm:gap-20">
          <div className="self-start aspect-square w-full sm:w-1/4">
            <img
              src={Sensei}
              alt="Sensei"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="sm:w-3/4 flex items-center">
            <h1 className="text-3xl sm:text-4xl">
              <span className="text-primary">High Performance</span> Tooling and
              Infrastructure for Provable Games and Applications
            </h1>
          </div>
        </div>
      </div>
      <div className="border-b border-white/20 bg-gradient-to-br from-[#181818] to-[#0c0c0c]">
        <div className="container mx-auto p-4 sm:p-6 lg:p-12 ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {cardContent.map((card, index) => (
              <Link
                to={card.link}
                key={index}
                className="p-6 sm:p-8 border border-[#252525] rounded-xl bg-gradient-to-br from-[#181818] to-[#0c0c0c] bg-opacity-30 backdrop-filter backdrop-blur-lg gap-4 sm:gap-8 shadow-lg hover:shadow-red-600/5 duration-150 hover:bg-[#0c0c0c] hover:bg-opacity-50 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30"></div>
                <div className="relative z-10">
                  <div className="items-center gap-4">
                    <h2 className="text-lg sm:text-xl font-bold">
                      {card.title}
                    </h2>
                    <div className="flex justify-start mt-3">{card.icon}</div>
                  </div>
                  <div className="mt-6">
                    <p
                      className="text-lg sm:text-xl"
                      style={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: "14px",
                        lineHeight: "1.8em",
                      }}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
