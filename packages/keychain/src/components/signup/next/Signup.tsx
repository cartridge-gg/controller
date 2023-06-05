import Joystick from "@cartridge/ui/components/icons/Joystick";
import { Circle, Button } from "@chakra-ui/react";
import { useState, useMemo, useCallback } from "react";
import { PageBanner, BottomSheet } from "./layout";
import { Props } from "./types";

export function Signup({ onLogin }: Props & { onLogin: () => void }) {
  const stepper = useStepper();

  return (
    <>
      <PageBanner
        title={stepper.value.title}
        description={stepper.value.description}
      >
        <Circle size={12} bgColor="darkGray.800" marginBottom={4}>
          <Joystick boxSize={8} />
        </Circle>
      </PageBanner>

      {/* <PageContainer></PageContainer> */}

      <BottomSheet>
        <Button
          marginBottom={4}
          // disabled={isDisabled || isLoading}
          // isLoading={isLoading}
          onClick={stepper.goNext}
        >
          Create
        </Button>

        <Button
          variant="darkGray"
          // disabled={isDisabled || isLoading}
          // isLoading={isLoading}
          onClick={onLogin}
        >
          Log In
        </Button>
      </BottomSheet>
    </>
  );
}

function useStepper() {
  const [index, setIndex] = useState(0);

  const steps = useMemo(
    () => [
      {
        name: "registration",
        title: "Sign Up",
        description: "What should I call you?",
      },
    ],
    [],
  );

  const value = useMemo(() => steps[index], [steps, index]);

  const canGoNext = useMemo(() => index > steps.length, [index, steps]);

  const goNext = useCallback(() => {
    if (index > steps.length) {
      setIndex((i) => i + 1);
    } else {
      console.error("There is no more steps.");
    }
  }, [index, steps]);

  return { value, goNext, canGoNext };
}
