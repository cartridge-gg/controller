import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  cn,
  Thumbnail,
} from "@cartridge/ui-next";
import { StarterItemData } from "@/context/starterpack";
interface NFTStarterItemProps extends StarterItemData {
  type: "NFT";
}

interface CreditStarterItemProps extends StarterItemData {
  type: "CREDIT";
}

export type StarterItemProps = NFTStarterItemProps | CreditStarterItemProps;

export const StarterItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StarterItemProps
>(({ title, description, image, type, className, price, ...props }, ref) => {
  const value =
    type === "CREDIT" ? (props as CreditStarterItemProps).value : undefined;

  return (
    <div className={cn("relative pt-1", className)} ref={ref} {...props}>
      <Card className="relative bg-background-100 overflow-visible h-[88px]">
        {/* Price tag */}
        <div className="absolute -top-1 right-4">
          <Union price={price} />
        </div>
        <CardContent className="py-3 px-4 overflow-visible h-full rounded-lg flex flex-row items-center gap-3">
          {/* <img src={image} alt={title} className="size-16 object-cover" /> */}
          <Thumbnail rounded={type === "CREDIT"} icon={image} className="size-16 p-1" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground-100 truncate">
              {type === "CREDIT" && value
                ? `${value} Credits`
                : price === 0
                  ? "FREE"
                  : title}
            </h3>
            <CardDescription className="font-normal text-xs text-foreground-200 line-clamp-2">
              {description}
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StarterItem.displayName = "StarterItem";

const Union = ({ price }: { price: number }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute bottom-0 left-0 w-1/2">
        <Subtract />
      </div>
      <svg
        width="48"
        height="36"
        viewBox="0 0 48 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.4375 0C1.09131 0 0 0.820418 0 1.83245V35.0824C0 35.7832 1.00383 36.2246 1.81626 35.881L23.4 28.6557C23.5855 28.5772 23.794 28.538 24 28.538C24.206 28.538 24.4145 28.5772 24.6 28.6557L46.1837 35.881C46.9962 36.2246 48 35.7832 48 35.0824V1.83245C48 0.820417 46.9087 0 45.5625 0H2.4375Z"
          fill="url(#paint0_linear_9891_43627)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_9891_43627"
            x1="24"
            y1="0"
            x2="24"
            y2="36"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2A2F2A" />
            <stop offset="1" stopColor="#242824" />
          </linearGradient>
        </defs>
      </svg>
      <span
        className={cn(
          "absolute font-semibold text-xs -translate-y-1/4",
          price === 0 ? "text-constructive-100" : "text-primary-200",
        )}
      >
        {price === 0 ? "FREE" : `$${price}`}
      </span>
    </div>
  );
};

const Subtract = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="46"
      height="35"
      viewBox="0 0 46 35"
      fill="none"
    >
      <g opacity="0.04">
        <path
          d="M45.2002 3.79951V0.268066C45.4161 0.31514 45.6178 0.38537 45.8002 0.474346V3.79951H45.2002Z"
          fill="url(#paint0_linear_9891_49636)"
        />
        <path
          d="M0.200195 3.79951V0.474346C0.382565 0.38537 0.584252 0.31514 0.800195 0.268066V3.79951H0.200195Z"
          fill="url(#paint1_linear_9891_49636)"
        />
        <path
          d="M0.200195 9.02217V5.72772H0.800195V9.02217H0.200195Z"
          fill="url(#paint2_linear_9891_49636)"
        />
        <path
          d="M45.2002 9.02217V5.72773H45.8002V9.02217H45.2002Z"
          fill="url(#paint3_linear_9891_49636)"
        />
        <path
          d="M0.200195 14.5638V11.2694H0.800195V14.5638H0.200195Z"
          fill="url(#paint4_linear_9891_49636)"
        />
        <path
          d="M45.2002 14.5638V11.2694H45.8002V14.5638H45.2002Z"
          fill="url(#paint5_linear_9891_49636)"
        />
        <path
          d="M0.200195 20.1055V16.811H0.800195V20.1055H0.200195Z"
          fill="url(#paint6_linear_9891_49636)"
        />
        <path
          d="M45.2002 20.1055V16.8111H45.8002V20.1055H45.2002Z"
          fill="url(#paint7_linear_9891_49636)"
        />
        <path
          d="M0.200195 25.6472V22.3527H0.800195V25.6472H0.200195Z"
          fill="url(#paint8_linear_9891_49636)"
        />
        <path
          d="M45.2002 25.6472V22.3527H45.8002V25.6472H45.2002Z"
          fill="url(#paint9_linear_9891_49636)"
        />
        <path
          d="M21.7812 26.9653C21.8357 26.944 21.8904 26.9244 21.945 26.9064L22.0978 27.4881C22.0591 27.5014 22.0205 27.5157 21.9823 27.531L20.4103 28.0572L20.2198 27.4882L21.772 26.9689L21.7812 26.9653Z"
          fill="url(#paint10_linear_9891_49636)"
        />
        <path
          d="M23.9026 27.4881L24.0554 26.9064C24.11 26.9244 24.1646 26.9442 24.2191 26.9655L25.7806 27.4882L25.5901 28.0572L24.0181 27.531C23.9798 27.5157 23.9413 27.5014 23.9026 27.4881Z"
          fill="url(#paint11_linear_9891_49636)"
        />
        <path
          d="M0.200195 31.1888V27.8944H0.800195V31.1888H0.200195Z"
          fill="url(#paint12_linear_9891_49636)"
        />
        <path
          d="M45.2002 31.1888V27.8944H45.8002V31.1888H45.2002Z"
          fill="url(#paint13_linear_9891_49636)"
        />
        <path
          d="M15.0143 29.8635L14.8239 29.2946L18.0419 28.2173L18.2323 28.7863L15.0143 29.8635Z"
          fill="url(#paint14_linear_9891_49636)"
        />
        <path
          d="M27.7681 28.7863L27.9585 28.2173L31.1765 29.2946L30.9861 29.8635L27.7681 28.7863Z"
          fill="url(#paint15_linear_9891_49636)"
        />
        <path
          d="M9.6184 31.6699L9.42794 31.1009L12.6459 30.0236L12.8364 30.5926L9.6184 31.6699Z"
          fill="url(#paint16_linear_9891_49636)"
        />
        <path
          d="M33.164 30.5926L33.3545 30.0236L36.5725 31.1009L36.382 31.6699L33.164 30.5926Z"
          fill="url(#paint17_linear_9891_49636)"
        />
        <path
          d="M4.22247 33.4762L4.032 32.9072L7.24998 31.83L7.44045 32.3989L4.22247 33.4762Z"
          fill="url(#paint18_linear_9891_49636)"
        />
        <path
          d="M38.5599 32.3989L38.7504 31.83L41.9684 32.9072L41.7779 33.4762L38.5599 32.3989Z"
          fill="url(#paint19_linear_9891_49636)"
        />
        <path
          d="M0.200195 34.8003V33.436H0.800195V33.9891L1.85404 33.6363L2.04451 34.2053L0.391674 34.7586L0.349086 34.7766C0.303777 34.7957 0.250521 34.8028 0.200195 34.8003Z"
          fill="url(#paint20_linear_9891_49636)"
        />
        <path
          d="M45.2002 33.9891V33.436H45.8002V34.8003C45.7499 34.8028 45.6966 34.7957 45.6513 34.7766L45.6087 34.7586L43.9559 34.2053L44.1463 33.6363L45.2002 33.9891Z"
          fill="url(#paint21_linear_9891_49636)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint12_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint14_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint15_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint16_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint17_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint18_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint19_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint20_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient
          id="paint21_linear_9891_49636"
          x1="23.0001"
          y1="35.0008"
          x2="23.0001"
          y2="0.0297845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.48" />
        </linearGradient>
      </defs>
    </svg>
  );
};
