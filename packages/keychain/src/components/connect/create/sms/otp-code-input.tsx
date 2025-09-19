import { Button, LayoutContent } from "@cartridge/ui";
import { useEffect, useRef, useState } from "react";

export const OtpCodeInput = ({
  phoneNumber,
  onBack,
  onFinalize,
}: {
  phoneNumber: string;
  onBack: () => void;
  onFinalize: (otpCode: string) => void;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";

      if (!isInputFocused && /^\d$/.test(e.key)) {
        e.preventDefault();
        const firstEmptyIndex = otpCode.findIndex((val) => val === "");
        const targetIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;

        if (firstEmptyIndex === -1) {
          setOtpCode(["", "", "", "", "", ""]);
        }

        const targetInput = inputRefs.current[targetIndex];
        if (targetInput) {
          targetInput.focus();
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          )?.set;
          nativeInputValueSetter?.call(targetInput, e.key);
          const inputEvent = new Event("input", { bubbles: true });
          targetInput.dispatchEvent(inputEvent);
        }
      }

      if (e.key === "Enter" && otpCode.every((digit) => digit !== "")) {
        e.preventDefault();
        onFinalize(otpCode.join(""));
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [otpCode, onFinalize]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;

    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      const newOtpCode = [...otpCode];
      digits.forEach((digit, i) => {
        if (index + i < 6 && /^\d$/.test(digit)) {
          newOtpCode[index + i] = digit;
        }
      });
      setOtpCode(newOtpCode);

      const nextEmptyIndex = newOtpCode.findIndex(
        (val, i) => i > index && val === "",
      );
      const focusIndex =
        nextEmptyIndex !== -1
          ? nextEmptyIndex
          : Math.min(index + digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    if (/^\d$/.test(value)) {
      const newOtpCode = [...otpCode];
      newOtpCode[index] = value;
      setOtpCode(newOtpCode);

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (value === "") {
      const newOtpCode = [...otpCode];
      newOtpCode[index] = "";
      setOtpCode(newOtpCode);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && otpCode[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    if (e.key === "Enter" && otpCode.every((digit) => digit !== "")) {
      e.preventDefault();
      onFinalize(otpCode.join(""));
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handleBlur = () => {
    setActiveIndex(null);
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <>
      <LayoutContent className="flex flex-col gap-3 w-full h-fit">
        <p className="w-full font-normal text-xs text-foreground-300">
          Please check {phoneNumber} for a message from Cartridge and enter your
          code below.
        </p>
        <div className="w-full h-fit gap-4 p-10 flex flex-row items-center justify-center">
          {otpCode.map((value, index) => (
            <NumberCard
              key={index}
              value={value}
              hasValue={value !== ""}
              error={value !== "" && isNaN(Number(value))}
              active={activeIndex === index}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              inputRef={(el) => {
                inputRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </LayoutContent>
      <div className="flex flex-row items-center justify-center py-4 pr-4 pl-4">
        <div className="flex flex-row border-t border-t-spacer-100 w-full h-fit pt-4 justify-between gap-4">
          <Button
            variant="secondary"
            className="px-8"
            onClick={() => {
              onBack();
            }}
          >
            Cancel
          </Button>
          <Button
            className="px-6 w-full"
            variant="primary"
            onClick={() => {
              onFinalize(otpCode.join(""));
            }}
            disabled={otpCode.some((digit) => digit === "")}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
};

const NumberCard = ({
  value = "",
  hasValue = false,
  error = false,
  active = false,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  inputRef,
}: {
  value?: string;
  hasValue?: boolean;
  error?: boolean;
  active?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}) => {
  return (
    <div className="relative w-10 h-[52px]">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]"
        maxLength={1}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`
          w-full h-full
          pt-4 pr-2 pb-4 pl-2
          text-center
          bg-[#181C19]
          border border-[#1E221F]
          rounded
          text-white
          font-medium
          text-lg
          outline-none
          transition-all
          ${active ? "border-primary ring-2 ring-primary/20" : ""}
          ${error ? "border-red-500" : ""}
          ${hasValue ? "text-white" : "text-transparent"}
        `}
        placeholder=""
      />
    </div>
  );
};
